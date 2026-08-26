import type { MetadataRoute } from "next";

/**
 * El panel interno se excluye de los buscadores.
 *
 * Esto NO es una medida de seguridad —robots.txt es una peticion, no una
 * barrera, y de hecho anuncia que la ruta existe—. Lo que protege el panel es
 * el middleware y la verificacion de sesion en `convex/admin.ts`. Esto solo
 * evita que /dashboard aparezca en resultados de busqueda.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: "/dashboard",
        },
    };
}
