"use client";
import Sidebar from "@/components/sidebar/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import React from "react";

const queryClient = new QueryClient();

export default function Layout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Sidebar>{children}</Sidebar>
      </SessionProvider>
    </QueryClientProvider>
  );
}
