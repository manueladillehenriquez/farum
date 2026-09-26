import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";
import { SESSION_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

/**
 * Protege /admin/**.
 *
 * Refresca la sesión de Supabase en cada request y deja pasar SOLO a un
 * usuario autenticado cuyo JWT trae app_metadata.role = "admin".
 * Todo lo demás va a /admin/login.
 *
 * IMPORTANTE: esto es la PRIMERA barrera, no la única. Cada página del
 * panel y cada Server Action vuelven a verificar la sesión en el servidor
 * (requireAdmin) y, por debajo, la base de datos aplica RLS. Nunca se
 * confía en un solo check.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  const env = getSupabasePublicEnv();
  let response = NextResponse.next({ request });

  let isAdmin = false;
  if (env) {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, { ...options, ...SESSION_COOKIE_OPTIONS });
          }
        },
      },
    });

    // getUser() valida el token contra el servidor de Auth (no solo la cookie).
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAdmin = user?.app_metadata?.role === "admin";
  }

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Conserva las cookies de sesión refrescadas.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!isLogin && !isAdmin) return redirectTo("/admin/login");
  if (isLogin && isAdmin) return redirectTo("/admin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
