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
          where: { email: email },
          include: {
            roles: {
              // global roles (UserRole)
              where: { companyId: null },
              include: {
                role: {
                  include: {
                    RolePermission: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
            companyUsers: {
              // companies this user belongs to
              include: {
                company: {
                  include: {
                    subscriptions: true,
                  },
                },
                role: {
                  include: {
                    RolePermission: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        console.log("Found user:", user);

        if (!user) throw new Error("No user found with the given email");
        if (!user.isActive)
          throw new Error("User is not active. Please contact admin");
        if (!user.isVerified)
          throw new Error("User is not verified. Please verify your email");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error("Incorrect password");

        // global roles/permissions
        const globalRoles = user.roles.map((r) => r.role.name);
        const globalPermissions = user.roles.flatMap((r) =>
          r.role.RolePermission.map((rp) => rp.permission.name)
        );

        // companies with their permissions
        const companies = user.companyUsers.map((cu) => ({
          companyId: cu.company.id,
          companyName: cu.company.name,
          isActive: cu.company.isActive,
          role: cu.role.name,
          permissions: cu.role.RolePermission.map((rp) => rp.permission.name),
          subscription:
            cu.company.subscriptions.length > 0
              ? cu.company.subscriptions[0] // pick latest or active
              : null,
        }));

        const response = {
          id: user.id,
          name: user.name,
          email: user.email,
          globalRoles, // e.g., ['superadmin']
          globalPermissions, // e.g., ['manage_superadmin_users', ...]
          companies, // list of companies they belong to
        };

        console.log("Auth response:", response);

        return response;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, trigger, user, session }) {
      // When user logs in initially
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.globalRoles = user.globalRoles;
        token.companies = user.companies;
        token.globalPermissions = user.globalPermissions;
      }

      // When client calls `session.update`
      if (trigger === "update" && session?.selectedCompanyId) {
        token.selectedCompanyId = session.selectedCompanyId;
        token.selectedCompanyRole = session.selectedCompanyRole;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.globalRoles = token.globalRoles;
      session.user.companies = token.companies;
      session.user.globalPermissions = token.globalPermissions;

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
