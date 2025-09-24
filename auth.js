import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { email, password } = credentials;

        // Get user + roles + company memberships
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            roles: {
              include: { role: true }, // global roles (like superadmin)
            },
            companyUsers: {
              include: {
                company: true,
                role: true, // the role inside that company
              },
            },
          },
        });

        if (!user) throw new Error("No user found with the given email");
        if (!user.isActive)
          throw new Error("User is not active. Please contact admin");
        if (!user.isVerified)
          throw new Error("User is not verified. Please verify your email");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error("Incorrect password");

        // Build list of companies
        const companies = user.companyUsers.map((cu) => ({
          companyId: cu.company.id,
          companyName: cu.company.name,
          companyActive: cu.company.isActive,
          role: cu.role.name,
        }));

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          globalRoles: user.roles.map((r) => r.role.name), // e.g., ['superadmin']
          companies, // list of companies they belong to
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, trigger, session }) {
      // When user logs in initially
      if (session?.user) {
        token.id = session.user.id;
        token.globalRoles = session.user.globalRoles;
        token.companies = session.user.companies;
      }

      // When client calls `session.update`
      if (trigger === "update" && session?.selectedCompanyId) {
        token.selectedCompanyId = session.selectedCompanyId;
        token.selectedCompanyRole = session.selectedCompanyRole;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.globalRoles = token.globalRoles;
      session.user.companies = token.companies;

      // Expose active company
      session.user.selectedCompanyId = token.selectedCompanyId || null;
      session.user.selectedCompanyRole = token.selectedCompanyRole || null;

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
});
