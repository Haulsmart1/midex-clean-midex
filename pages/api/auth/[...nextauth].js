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

          return null; // ❌ No matching user
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
          if (error || !data?.user) return null;
          const { data: profile, error: profileError } = await verified.from('users')
            .select('name, role, roles, partner_type, is_active')
            .eq('id', data.user.id).maybeSingle();
          if (profileError || !profile || profile.is_active === false) return null;
          return {
            id: data.user.id, email: data.user.email, name: profile.name || '',
            role: profile.role, roles: profile.roles, partner_type: profile.partner_type || '',
          };
        } catch { return null; }
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
