import { auth } from "@/auth";
export default auth(req => {
  const path = req.nextUrl.pathname;
  if ((path.startsWith("/dashboard") || path.startsWith("/calculator") || path.startsWith("/results") || path.startsWith("/profile") || path.startsWith("/admin")) && !req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
});
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
