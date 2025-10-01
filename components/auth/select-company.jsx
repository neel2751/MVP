"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SelectCompanyPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  const companies = session.user.companies || [];

  // If only one company, auto-select
  if (companies.length === 1) {
    update({
      selectedCompanyId: companies[0].companyId,
      selectedCompanyRole: companies[0].role,
    });
    router.push("/dashboard");
    return null;
  }

  const handleSelect = async () => {
    if (!selectedCompanyId) return;

    // This triggers the jwt callback with trigger === "update"
    await update({ selectedCompanyId });

    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-xl font-semibold">Select a Company</h1>
      <select
        className="border p-2 rounded"
        value={selectedCompanyId}
        onChange={(e) => setSelectedCompanyId(e.target.value)}
      >
        <option value="">-- Select Company --</option>
        {companies.map((c) => (
          <option key={c.companyId} value={c.companyId}>
            {c.companyName}
          </option>
        ))}
      </select>
      <Button onClick={handleSelect} disabled={!selectedCompanyId}>
        Continue
      </Button>
    </div>
  );
}
