import { Suspense } from "react";
import { getCompaniesForSales } from "@/actions/sales";
import { SalesManagement } from "@/components/sales/sales-management";

export default async function AdminSalesPage() {
  const companiesResult = await getCompaniesForSales();
  const companies = companiesResult.success ? companiesResult.companies : [];

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading sales dashboard...</div>}>
        <SalesManagement initialCompanies={companies} />
      </Suspense>
    </div>
  );
}
