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
        // Use Supabase Auth API
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data?.user) return null;

        const userId = data.user.id;

        // Now fetch extended profile info if needed
        const { data: userMeta, error: userMetaError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userMetaError || !userMeta) return null;

        return {
          id: userId,
          email: data.user.email,
          name: userMeta.name || "",
          role: userMeta.role,
          roles: userMeta.roles,
          partner_type: userMeta.partner_type || "",
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
        token.partner_type = user.partner_type || "";
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
        partner_type: token.partner_type || "",
      };
      return session;
    }
  }
};

export default NextAuth(authOptions);
