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
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
        isFirebase: { label: "Is Firebase", type: "text" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Missing email");
        }
        
        const emailClean = credentials.email.trim().toLowerCase();
        
        let user = await prisma.user.findUnique({
          where: { email: emailClean }
        });

        if (!user) {
          if (credentials.loginType === 'partner') {
            throw new Error("Email not found. Please register your business.");
          }
          // Auto-register user account on the fly for customers
          let passwordHash = "";
          if (credentials.password) {
            passwordHash = await bcrypt.hash(credentials.password, 10);
          }
          const namePart = emailClean.split('@')[0];
          const formattedName = credentials.name || (namePart.charAt(0).toUpperCase() + namePart.slice(1));
          
          user = await prisma.user.create({
            data: {
              email: emailClean,
              name: formattedName,
              passwordHash,
              averageRating: 5.0,
            }
          });
        } else {
          // If not logging in via Firebase, verify password
          if (credentials.isFirebase !== 'true') {
            if (!credentials.password) throw new Error("Missing password");
            
            const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isPasswordValid) {
              throw new Error("Invalid credentials. Please check your email and password.");
            }
          }
          
          if (credentials.loginType === 'partner') {
            if (user.role === 'customer') {
              throw new Error("This is a customer account. Please use Customer Login.");
            }
            if (user.partnerStatus === 'pending') {
              throw new Error("Your application is under review by Admin.");
            }
            if (user.partnerStatus === 'rejected') {
              throw new Error("Your application was rejected. Please contact support.");
            }
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          partnerStatus: user.partnerStatus,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.partnerStatus = (user as any).partnerStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).partnerStatus = token.partnerStatus as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};
