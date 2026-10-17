import { defineConfig } from "vitest/config";

/**
 * Pruebas de las funciones de Convex.
 *
 * `convex-test` levanta un backend en memoria, asi que las pruebas no tocan
 * ningun despliegue: se pueden correr sin credenciales y sin miedo a borrar
 * datos reales.
 *
 * El entorno `edge-runtime` imita el runtime donde corren las funciones de
 * Convex. Con el de Node, algunas pruebas pasarian aqui y fallarian al
 * desplegar.
 */
export default defineConfig({
    test: {
        environment: "edge-runtime",
        include: ["convex/**/*.test.ts"],
        server: { deps: { inline: ["convex-test"] } },
    },
});
