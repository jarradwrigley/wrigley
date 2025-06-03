import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      request.nextauth.token?.role !== "admin"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/super-admin") &&
      request.nextauth.token?.role !== "superadmin"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      (request.nextUrl.pathname.startsWith("/profile") ||
        request.nextUrl.pathname.startsWith("/subscriptions") ||
        request.nextUrl.pathname.startsWith("/orders")) &&
      !request.nextauth.token?.id
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    // if (
    //   request.nextUrl.pathname.startsWith("/dashboard") &&
    //   request.nextauth.token?.role === "admin"
    // ) {
    //   return NextResponse.rewrite(new URL("/admin", request.url));
    // }

    if (
      request.nextUrl.pathname.startsWith("/client") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "manager"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // "/admin/:path*",
    "/super-admin/:path*",
    "/profile/:path*",
    "/subscriptions/:path*",
    "/orders/:path*",
    "/client/:path*",
  ],
};

// import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(request: NextRequestWithAuth) {
//     const token = request.nextauth.token;
//     const { pathname } = request.nextUrl;

//     // If no token, let NextAuth handle the redirect
//     if (!token) {
//       return NextResponse.redirect(
//         new URL("/api/auth/signin?callbackUrl=" + pathname, request.url)
//       );
//     }

//     // Admin route protection
//     if (pathname.startsWith("/admin") && token.role !== "admin") {
//       return NextResponse.redirect(new URL("/denied", request.url));
//     }

//     // Dashboard logic - fix the flow issue
//     if (pathname.startsWith("/dashboard")) {
//       if (token.role === "admin") {
//         return NextResponse.redirect(new URL("/admin", request.url));
//       }
//       // Remove the else that always redirects to "/"
//       // Let non-admins access dashboard normally
//     }

//     // Client route protection
//     if (
//       pathname.startsWith("/client") &&
//       token.role !== "admin" &&
//       token.role !== "manager"
//     ) {
//       return NextResponse.redirect(new URL("/denied", request.url));
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//   }
// );

// export const config = {
//   matcher: ["/extra", "/client", "/dashboard", "/admin"],
// };
