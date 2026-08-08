import { NextResponse, type NextRequest } from "next/server";

import { VOTER_COOKIE, VOTER_COOKIE_MAX_AGE } from "@/lib/voter";

/**
 * Nobody signs in, so a long-lived random cookie is what keeps one person from
 * upvoting the same Tedism twenty times. Assigning it here means every page and
 * route handler can assume the token already exists.
 *
 * This lives in `src/` next to `app/` on purpose — sitting at the repository
 * root it is silently never invoked.
 */
export function proxy(request: NextRequest) {
  const existing = request.cookies.get(VOTER_COOKIE)?.value;

  if (existing) {
    return NextResponse.next();
  }

  const token = crypto.randomUUID();

  // Writing it onto the request as well means the page rendering *this* request
  // already sees the token, so a first-time visitor can vote without reloading.
  request.cookies.set(VOTER_COOKIE, token);

  const response = NextResponse.next({ request });

  response.cookies.set(VOTER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VOTER_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
