// Role hierarchy (higher roles inherit lower role permissions)
export const roleHierarchy = {
  superadmin: [
    "admin",
    "company_admin",
    "branch_manager",
    "agent",
    "landlord",
    "tenant",
    "contractor",
    "guest",
  ],
  admin: ["company_admin", "branch_manager", "agent"],
  company_admin: ["branch_manager", "agent", "landlord"],
  branch_manager: ["agent", "guest"],
  agent: ["guest"],
  landlord: [],
  tenant: [],
  contractor: [],
  guest: [],
};
