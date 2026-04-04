import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLoginLock(identifier: string): { locked: boolean; retryAfter?: number } {
  const entry = loginAttempts.get(identifier);
  if (!entry) return { locked: false };
  if (Date.now() < entry.lockedUntil) {
    return { locked: true, retryAfter: Math.ceil((entry.lockedUntil - Date.now()) / 1000) };
  }
  loginAttempts.delete(identifier);
  return { locked: false };
}

function recordFailedLogin(identifier: string) {
  const entry = loginAttempts.get(identifier);
  const now = Date.now();
  if (!entry || entry.lockedUntil < now) {
    loginAttempts.set(identifier, { count: 1, lockedUntil: now + 15 * 60 * 1000 });
    return;
  }
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000;
  }
  loginAttempts.set(identifier, entry);
}

function recordSuccessfulLogin(identifier: string) {
  loginAttempts.delete(identifier);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const email = credentials.email.toLowerCase().trim();

          const lock = checkLoginLock(email);
          if (lock.locked) {
            return null;
          }

          const rl = await rateLimit("auth_login", 10, 60 * 1000);
          if (!rl.success) {
            return null;
          }

          const admin = await prisma.admin.findUnique({
            where: { email },
          });

          if (!admin) {
            recordFailedLogin(email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);
          if (!isValid) {
            recordFailedLogin(email);
            return null;
          }

          recordSuccessfulLogin(email);

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? `__Host-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: true,
};
