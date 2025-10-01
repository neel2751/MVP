const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// async function main() {
//   const roles = [
//     // Global Roles (isGlobal: true)
//     { name: "sales_team", isGlobal: true },
//     { name: "customer_support", isGlobal: true },
//     { name: "finance_team", isGlobal: true },
//     { name: "invoice_team", isGlobal: true },

//     // Tenant-Specific Roles (isGlobal: false)
//     { name: "company-admin", isGlobal: false },
//     { name: "branch-admin", isGlobal: false },
//     { name: "tenant", isGlobal: false },
//     { name: "landlord", isGlobal: false },
//     { name: "contractor", isGlobal: false },
//   ];

//   for (const role of roles) {
//     await prisma.role.upsert({
//       where: { name: role.name },
//       update: { isGlobal: role.isGlobal },
//       create: role,
//     });
//   }
// }

// async function main() {
//   const permissions = [
//     // Global permissions
//     {
//       name: "manage_superadmin_users",
//       description: "Allows managing other superadmin accounts",
//     },
//     {
//       name: "manage_sales_team",
//       description: "Allows creating and managing sales team members",
//     },
//     {
//       name: "view_global_dashboard",
//       description: "Allows access to the main administrative dashboard",
//     },
//     { name: "create_company", description: "Allows creating new companies" },

//     // Tenant-specific permissions
//     {
//       name: "manage_company_users",
//       description: "Allows managing users within a specific company",
//     },
//     {
//       name: "view_company_dashboard",
//       description: "Allows viewing the company-specific dashboard",
//     },
//     {
//       name: "create_invoice",
//       description: "Allows creating invoices for a company",
//     },
//     {
//       name: "view_invoice_team",
//       description: "Allows viewing invoices for a specific team",
//     },
//     { name: "edit_property", description: "Allows editing properties" },
//     {
//       name: "manage_subscription",
//       description: "Allows managing the company's subscription",
//     },
//   ];

//   for (const permission of permissions) {
//     await prisma.permission.upsert({
//       where: { name: permission.name },
//       update: { description: permission.description },
//       create: permission,
//     });
//   }
// }

async function main() {
  const superadminRole = await prisma.role.findUnique({
    where: { name: "superadmin" },
  });
  const allPermissions = await prisma.permission.findMany();
  if (superadminRole) {
    for (const permission of allPermissions) {
      const existingLink = await prisma.rolePermission.findFirst({
        where: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      });
      if (!existingLink) {
        await prisma.rolePermission.create({
          data: {
            roleId: superadminRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
