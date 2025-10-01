import QueryProvider from "@/components/provider/query-provider";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Sidebar from "@/components/sidebar/sidebar";

export default function Layout({ children }) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <SessionProvider>
          <Sidebar>{children}</Sidebar>
        </SessionProvider>
      </NuqsAdapter>
    </QueryProvider>
  );
}
