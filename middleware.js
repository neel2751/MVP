import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const pathname = url.pathname;

  // 1. Allow public/asset paths (API, static files, favicon)
  // NOTE: Your config matcher should handle most of this, but keeping API/asset checks here is safer.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Handle NOT LOGGED IN / Redirect to /auth
  const isAuthPage = pathname.startsWith("/auth");

  if (!token) {
    // If user is not logged in AND they are already on an auth page, allow them to stay.
    if (isAuthPage) {
      return NextResponse.next();
    }

    // Otherwise, redirect them to the /auth page
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // 3. Handle LOGGED IN but accessing auth pages (redirect to dashboard)
  if (
    isAuthPage &&
    !pathname.includes("select-company") &&
    !pathname.includes("no-company")
  ) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ... (Keep the rest of your original logic unchanged) ...

  if (Array.isArray(token.globalRoles) && token.globalRoles.length > 0) {
    return NextResponse.next();
  }

  const companies = token.companies || [];
  const selectedCompanyId = token.selectedCompanyId;

  if (companies.length === 0) {
    // User not linked to any company
    if (pathname === "/auth/no-company") return NextResponse.next(); // Prevent loop
    url.pathname = "/auth/no-company";
    return NextResponse.redirect(url);
  }

  // ... (other checks that redirect to auth pages must also check if the user is already there) ...

  if (companies.length > 1 && !selectedCompanyId) {
    // Show selection page if multiple companies
    if (pathname === "/auth/select-company") return NextResponse.next(); // Prevent loop
    url.pathname = "/auth/select-company";
    return NextResponse.redirect(url);
  }

  // Find the selected company
  const activeCompany = companies.find(
    (c) => c.companyId === selectedCompanyId
  );

  if (!activeCompany) {
    // Invalid selected company
    if (pathname === "/auth/select-company") return NextResponse.next(); // Prevent loop
    url.pathname = "/auth/select-company";
    return NextResponse.redirect(url);
  }

  // ... (rest of your valid checks) ...

  // Everything is valid, continue
  return NextResponse.next();
}

// ⚠️ Configuration adjustment: Ensure your matcher excludes ALL auth pages completely.
// If you use Next-Auth, Next.js handles the /api/auth routes automatically.
export const config = {
  matcher: [
    /* Apply to all paths except: */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/.*|auth$).*)",
  ],
};
