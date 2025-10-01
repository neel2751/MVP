"use server";
import { getCurrentUser } from "./auth-user";
import { prisma } from "@/lib/prisma";

export async function logAuditEntry(formData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const auditEntry = await prisma.AuditLog.create({
      data: {
        userId: user.id,
        action: formData.action,
        entity: formData.entity,
        entityId: formData.entityId || null,
        changes: formData.changes || null,
      },
    });

    // Optionally revalidate a path if this affects any cached pages
    // revalidatePath("/some-path");

    return { success: true, auditEntry };
  } catch (error) {
    console.error("Error logging audit entry:", error);
    return { success: false, error: "Failed to log audit entry" };
  }
}
