import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale routing only — auth is enforced server-side in dashboard layouts
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all paths except API routes, Next.js internals, and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
