import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const emailClean = credentials.email.trim().toLowerCase();
        
        let user = await prisma.user.findUnique({
          where: { email: emailClean }
        });

        if (!user) {
          // Auto-register user account on the fly for any valid email & password
          const passwordHash = await bcrypt.hash(credentials.password, 10);
          const namePart = emailClean.split('@')[0];
          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          
          user = await prisma.user.create({
            data: {
              email: emailClean,
              name: formattedName,
              passwordHash,
              averageRating: 5.0,
            }
          });
        } else {
          // Verify password, or update password to match if updated
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            const newPasswordHash = await bcrypt.hash(credentials.password, 10);
            user = await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: newPasswordHash }
            });
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};
