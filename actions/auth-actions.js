"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function login(formData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof AuthError) {
      // The original error you threw is available here.
      const originalError = error.cause?.err;

      // Check if a specific error message was passed.
      if (originalError?.message) {
        // Return the specific message to the client.
        return { error: originalError.message };
      }

      // Fallback for NextAuth's own generic errors.
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    // For other unexpected errors that aren't AuthErrors.
    return { error: "An unexpected error occurred." };
  }
}
