// Clerk auth middleware (Next.js 16 renamed `middleware.ts` -> `proxy.ts`).
//
// `clerkMiddleware()` runs on every matching request before it reaches a page
// or API route. It reads the Clerk session cookie/token and makes `auth()` and
// `currentUser()` work in server components, route handlers, and server actions.
// On its own it does NOT block anything - it only wires up auth context. To force
// sign-in on certain paths, add `createRouteMatcher` + `auth.protect()` here.
//
// `config.matcher` controls which requests this runs on:
//   - everything except Next.js internals (`_next`) and static files
//   - always on `/__clerk/*` (Clerk's frontend API proxy endpoints)
//   - always on `/api/*` and `/trpc/*`
//
// Must live at `src/proxy.ts` or project-root `proxy.ts` for Clerk to work.
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};