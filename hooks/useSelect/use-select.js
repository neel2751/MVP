"use client";
import { selectSubscriptionPlans } from "@/actions/selectAction/selectAction";
import { createSelectHook } from "./use-select-hook";

export const useSelectSubscriptionPlan = createSelectHook(
  selectSubscriptionPlans,
  ["selectSubscriptionPlans"]
);
