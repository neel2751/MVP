import { prisma } from "./prisma";

export async function withTransaction(callback) {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const result = await callback(prisma);
      return result;
    } catch (error) {
      console.error("Transaction error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during the transaction",
      };
    }
  });
  return transaction;
}
