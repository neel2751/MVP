"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ReusableTabs({ tabs, queryParam = "tab" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get(queryParam) || tabs[0].value;
  const [currentTab, setCurrentTab] = useState(initialTab);

  useEffect(() => {
    // Update tab when URL changes
    const tabFromUrl = searchParams.get(queryParam);
    if (tabFromUrl && tabFromUrl !== currentTab) {
      setCurrentTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (value) => {
    setCurrentTab(value);

    // Update URL without refreshing page
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryParam, value);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
