import { getSubscriptionPlans } from "@/actions/plan/subscription-plan";
import { auth } from "@/auth";
import { SubscriptionPlanManagement } from "@/components/plan/subscription-management";
import { Suspense } from "react";

export default async function SuperAdminSubscriptionPlansPage() {
  const session = await auth();

  const plansResult = await getSubscriptionPlans();
  const plans = plansResult.success ? plansResult.plans : [];

  return (
    <Suspense fallback={<div>Loading subscription plans...</div>}>
      <SubscriptionPlanManagement initialPlans={plans} />
    </Suspense>
  );
}
