/** App routes in one place so links and redirects never drift apart. */
export const routes = {
  home: "/",
  login: "/login",
  authCallback: "/auth/callback",
  signOut: "/auth/signout",
  inbox: "/inbox",
  tracker: "/tracker",
  settings: "/settings",
  share: "/share",
  item: (id: string) => `/items/${id}`,
  join: (token: string) => `/join/${token}`,
} as const;

/** Paths a signed-out visitor may open. */
const publicPrefixes = ["/login", "/auth/", "/api/", "/manifest.webmanifest", "/sw.js", "/icons/"];

export function isPublicPath(pathname: string): boolean {
  return pathname === routes.home || publicPrefixes.some((p) => pathname.startsWith(p));
}

/** Only allow redirects back into this app, never to another site. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return routes.inbox;
  return next;
}
