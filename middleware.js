import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Allow public paths
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    // Not logged in
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (Array.isArray(token.globalRoles) && token.globalRoles.length > 0) {
    return NextResponse.next();
  }

  const companies = token.companies || [];
  const selectedCompanyId = token.selectedCompanyId;

  if (companies.length === 0) {
    // User not linked to any company
    url.pathname = "/auth/no-company";
    return NextResponse.redirect(url);
  }

  if (companies.length === 1 && !selectedCompanyId) {
    // Auto-select if only one company
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (companies.length > 1 && !selectedCompanyId) {
    // Show selection page if multiple companies
    url.pathname = "/auth/select-company";
    return NextResponse.redirect(url);
  }

  // Find the selected company
  const activeCompany = companies.find(
    (c) => c.companyId === selectedCompanyId
  );

  if (!activeCompany) {
    // Invalid selected company
    url.pathname = "/auth/select-company";
    return NextResponse.redirect(url);
  }

  // Check if company is active
  if (!activeCompany.isActive) {
    url.pathname = "/auth/company-inactive";
    return NextResponse.redirect(url);
  }

  // Check subscription / free trial
  const now = new Date();
  const subscription = activeCompany.subscription;

  if (!subscription || subscription.status === "canceled") {
    url.pathname = "/auth/subscription-expired";
    return NextResponse.redirect(url);
  }

  if (subscription.status === "expired") {
    url.pathname = "/auth/subscription-expired";
    return NextResponse.redirect(url);
  }

  if (subscription.isTrial && new Date(subscription.endDate) < now) {
    url.pathname = "/auth/trial-expired";
    return NextResponse.redirect(url);
  }

  // Everything is valid, continue
  return NextResponse.next();
}

// Apply to all routes except public assets and auth pages
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth).*)"],
};
