import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * Protege /dashboard. Todo lo demas del sitio es publico.
 *
 * Esta es la PRIMERA de dos capas. La segunda vive en `convex/admin.ts`, donde
 * cada query verifica la sesion por su cuenta: las funciones de Convex son
 * alcanzables por su propia URL sin pasar por Next, asi que el middleware solo
 * evita que se vea la pagina, no que se lean los datos.
 *
 * La pagina de acceso se excluye a proposito: esta bajo /dashboard, asi que sin
 * la excepcion se redirigiria a si misma en un bucle infinito.
 */
const esRutaPrivada = createRouteMatcher(["/dashboard(.*)"]);
const esPaginaAcceso = createRouteMatcher(["/dashboard/acceso"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
    const autenticado = await convexAuth.isAuthenticated();

    if (esRutaPrivada(request) && !esPaginaAcceso(request) && !autenticado) {
        return nextjsMiddlewareRedirect(request, "/dashboard/acceso");
    }

    // Si ya inicio sesion, no tiene sentido mostrarle el formulario de acceso.
    if (esPaginaAcceso(request) && autenticado) {
        return nextjsMiddlewareRedirect(request, "/dashboard");
    }
});

export const config = {
    matcher: [
        "/dashboard",
        "/dashboard/:path*",
        // OBLIGATORIA: por aqui el navegador intercambia los tokens con Convex
        // Auth. Sin ella, iniciar sesion y crear cuenta fallan sin decir por que.
        "/api/auth",
    ],
};

// Nota sobre el matcher: a proposito NO se usa el patron amplio con lookahead
// que traen los ejemplos. Ademas de que en esta version de Next no coincidia con
// /dashboard —dejando la ruta sin proteger—, obligaria a renderizar en servidor
// todas las paginas publicas del sitio.
