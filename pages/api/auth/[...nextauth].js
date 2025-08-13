import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabaseClient";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // ✅ Secure login via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error || !data.user) {
          console.error("Login error:", error?.message || "User not found");
          return null;
        }

        // Extract custom fields from user_metadata
        const user = data.user;
        const metadata = user.user_metadata || {};

        return {
          id: user.id,
          email: user.email,
          name: metadata.name || "",
          role: metadata.role || "user",
          roles: metadata.roles || [],
          partner_type: metadata.partner_type || "",
        };
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.roles = user.roles;
        token.partner_type = user.partner_type;
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
        partner_type: token.partner_type,
      };
      return session;
    }
  }
};

export default NextAuth(authOptions);
