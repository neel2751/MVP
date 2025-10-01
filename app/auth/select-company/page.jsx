import { SessionProvider } from "next-auth/react";
import SelectCompanyPage from "../../../components/auth/select-company";

export default function Page() {
  return (
    <SessionProvider>
      <SelectCompanyPage />
    </SessionProvider>
  );
}
