import { NextResponse } from "next/server";
import type { MiddlewareFactory } from "@/lib/types";
import { getCurrentUser } from "@/providers/auth-provider";

const ROUTES_REQUIRING_AUTH = ["/profile", "/admin", "/liveseries/watch"];
const ROUTES_REQUIRING_NOAUTH = ["/login", "/signup"];
const ROUTES_REQUIRING_ADMIN = ["/admin"];

export const authMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const redirect = (to: string) =>
      NextResponse.redirect(new URL(to, request.url));
    const user = await getCurrentUser();
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