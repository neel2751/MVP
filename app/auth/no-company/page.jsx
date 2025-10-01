import { auth } from "@/auth";
import SignOutButton from "@/components/auth/sign-out";
import React from "react";

export default async function Page() {
  const session = await auth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">No Company Found</h1>
        <p className="text-gray-700">
          It seems that there is no company associated with your account. Please
          contact the administrator to set up your company.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          User: {session?.user?.email}
          {JSON.stringify(session.user)}
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
