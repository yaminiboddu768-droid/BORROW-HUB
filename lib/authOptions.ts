import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/auditLogger";

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
          if (credentials.isFirebase === 'true') {
            // Auto-register Firebase users
            const namePart = emailClean.split('@')[0];
            const formattedName = credentials.name || (namePart.charAt(0).toUpperCase() + namePart.slice(1));
            
            user = await prisma.user.create({
              data: {
                email: emailClean,
                name: formattedName,
                passwordHash: "", // Firebase handles auth
                averageRating: 5.0,
              }
            });
          } else {
            throw new Error("Invalid credentials. Please check your email and password.");
          }
        }

        if (user.status === 'BLOCKED') {
          throw new Error("Your account has been blocked. Please contact support.");
        }
        if (user.status === 'REJECTED') {
          throw new Error("Your account application was rejected.");
        }
        if (user.status === 'PENDING') {
          throw new Error("Your account is pending approval.");
        }

        // If not logging in via Firebase, verify password
        if (credentials.isFirebase !== 'true') {
          if (!credentials.password) throw new Error("Missing password");
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            throw new Error("Invalid credentials. Please check your email and password.");
          }
        }
        
        if (credentials.loginType === 'partner') {
            if (user.role === 'customer' || user.role === 'USER') {
              throw new Error("This is a customer account. Please use Customer Login.");
            }
            if (user.partnerStatus === 'pending') {
              throw new Error("Your application is under review by Admin.");
            }
            if (user.partnerStatus === 'rejected') {
              throw new Error("Your application was rejected. Please contact support.");
            }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
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
        token.status = (user as any).status;
        token.partnerStatus = (user as any).partnerStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).status = token.status as string;
        (session.user as any).partnerStatus = token.partnerStatus as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (user) {
        await logActivity({
          userId: user.id,
          role: (user as any).role || 'USER',
          action: 'LOGIN',
          details: 'User signed in',
        });
      }
    },
    async signOut({ session }) {
      if (session?.user?.id) {
        await logActivity({
          userId: session.user.id,
          action: 'LOGOUT',
          details: 'User signed out',
        });
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};
