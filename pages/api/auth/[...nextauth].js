// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = credentials;

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error || !data?.user || !data.session?.access_token || !data.session?.refresh_token) {
            console.error('[NextAuth] Supabase login failed:', error?.message || error);
            return null;
          }

          const userId = data.user.id;

          // 1. Check 'users' table
          const { data: userMeta } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (userMeta) {
            return {
              id: userId,
              email: data.user.email,
              name: userMeta.name || '',
              role: userMeta.role,
              roles: userMeta.roles,
              partner_type: userMeta.partner_type || '',
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            };
          }

          // 2. Check 'customs_agents' table
          const { data: agentMeta } = await supabase
            .from('customs_agents')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (agentMeta) {
            return {
              id: userId,
              email: data.user.email,
              name: agentMeta.name || '',
              role: 'customs_agent',
              roles: ['customs_agent'],
              partner_type: 'customs_agent',
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            };
          }

          // 3. Check 'currys_users' table
          const { data: currysUser } = await supabase
            .from('currys_users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (currysUser) {
            return {
              id: userId,
              email: data.user.email,
              name: currysUser.name || '',
              role: 'currys_user',
              roles: ['currys_user'],
              partner_type: 'currys',
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            };
          }

          return null; // No matching user
        } catch (err) {
          console.error('[NextAuth] Authorize Error:', err);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'supabase-session',
      name: 'Verified Supabase magic link',
      credentials: {
        accessToken: { label: 'Access token', type: 'text' },
        refreshToken: { label: 'Refresh token', type: 'text' },
      },
      authorize: async (credentials) => {
        const { accessToken, refreshToken } = credentials || {};
        if (!accessToken || !refreshToken) return null;
        try {
          const verified = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { auth: { persistSession: false, autoRefreshToken: false },
              global: { headers: { Authorization: `Bearer ${accessToken}` } } }
          );
          const { data, error } = await verified.auth.getUser(accessToken);
          if (error || !data?.user) {
            console.warn('[Midnight auth] token_verification_failed', { code: error?.code || 'unverified' });
            return null;
          }
          const { data: profile, error: profileError } = await verified.from('users')
            .select('name, role, roles, partner_type, is_active')
            .eq('id', data.user.id).maybeSingle();
          if (profileError) {
            console.warn('[Midnight auth] profile_lookup_failed', { code: profileError.code || 'unknown' });
            return null;
          }
          if (!profile || profile.is_active === false) {
            console.warn('[Midnight auth] profile_missing_or_inactive');
            return null;
          }

          const profileRoles = Array.isArray(profile.roles)
            ? profile.roles.filter((role) => typeof role === 'string' && role.trim())
            : [];
          let assignedRoles = [];

          // Some existing accounts keep their approved role in user_roles while
          // the legacy users.role fields are empty. Read only the verified user's
          // stored assignments; never infer authorisation from user metadata.
          if (!profile.role && profileRoles.length === 0) {
            const { data: roleRows, error: roleError } = await verified
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id);
            if (roleError) {
              console.warn('[Midnight auth] assigned_role_lookup_failed', { code: roleError.code || 'unknown' });
              return null;
            }
            assignedRoles = (roleRows || [])
              .map((row) => row?.role)
              .filter((role) => typeof role === 'string' && role.trim());
          }

          const role = profile.role || assignedRoles[0] || null;
          const roles = profileRoles.length > 0 ? profileRoles : assignedRoles;
          if (!role && roles.length === 0) {
            console.warn('[Midnight auth] approved_role_missing');
            return null;
          }
          return {
            id: data.user.id, email: data.user.email, name: profile.name || '',
            role, roles, partner_type: profile.partner_type || '',
          };
        } catch {
          console.warn('[Midnight auth] session_authorization_exception');
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.roles = user.roles;
        token.partner_type = user.partner_type || '';
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        roles: token.roles,
        partner_type: token.partner_type || '',
      };
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default async function authHandler(req, res) {
  try {
    return await NextAuth(req, res, authOptions);
  } catch (error) {
    console.error('[NextAuth] Unexpected error in handler:', error);
    res.status(500).end('Internal Server Error');
  }
}
