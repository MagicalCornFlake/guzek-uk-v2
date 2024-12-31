import { refreshAccessToken } from "@/lib/backend-v2";
import { User, type MiddlewareFactory } from "@/lib/types";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ROUTES_REQUIRING_AUTH = ["/profile", "/admin", "/liveseries/watch"];
const ROUTES_REQUIRING_NOAUTH = ["/login", "/signup"];
const ROUTES_REQUIRING_ADMIN = ["/admin"];

export async function getCurrentUser(cookieStore: ReadonlyRequestCookies) {
  const value = cookieStore.get("user")?.value;
  if (!value) {
    const success = await refreshAccessToken();
    if (!success) return null;
    return getCurrentUser(cookieStore);
  }
  try {
    return JSON.parse(value) as User;
  } catch (error) {
    console.error("Error parsing user cookie", error);
    return null;
  }
}

export const authMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const redirect = (to: string) =>
      NextResponse.redirect(new URL(to, request.url));
    const user = await getCurrentUser(await cookies());
    const [redirectFrom, redirectTo] = user?.admin
      ? [ROUTES_REQUIRING_NOAUTH, "/profile"]
      : [ROUTES_REQUIRING_AUTH, "/login"];
    for (const route of redirectFrom) {
      if (request.nextUrl.pathname.startsWith(route)) {
        return redirect(redirectTo);
      }
    }
    if (!user?.admin) {
      for (const route of ROUTES_REQUIRING_ADMIN) {
        if (request.nextUrl.pathname.startsWith(route)) {
          return redirect("/error/403");
        }
      }
    }
    return next(request);
  };
