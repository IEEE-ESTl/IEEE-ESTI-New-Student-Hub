/**
 * Borra `.open-next` antes de compilar para Cloudflare.
 *
 * POR QUE EXISTE ESTE ARCHIVO
 *
 * `opennextjs-cloudflare build` empieza borrando `.open-next` para
 * regenerarla. En Windows eso falla si el servidor de desarrollo esta
 * encendido: Turbopack vigila la carpeta del proyecto entera, incluida
 * `.open-next`, y mantiene abiertos manejadores sobre sus subcarpetas.
 *
 * El error que sale sin esto es un volcado de pila con `EPERM ... rmSync` que
 * no dice en ningun lado que la causa sea el servidor de desarrollo. Este
 * script hace el mismo borrado antes, y cuando falla por un bloqueo explica
 * que hay que hacer.
 *
 * No se puede arreglar en `next.config.ts`: la unica opcion de `watchOptions`
 * en Next 15.5 es `pollIntervalMs`, y `webpack.watchOptions.ignored` no aplica
 * porque el proyecto usa Turbopack.
 */

import { existsSync, rmSync } from "node:fs";

const CARPETA = ".open-next";

if (!existsSync(CARPETA)) {
    process.exit(0);
}

try {
    rmSync(CARPETA, { recursive: true, force: true });
} catch (fallo) {
    // EPERM y EBUSY son las dos formas en que Windows dice "esto esta abierto".
    if (fallo.code !== "EPERM" && fallo.code !== "EBUSY") {
        throw fallo;
    }

    console.error(
        [
            "",
            `  No se pudo borrar ${CARPETA}: hay un proceso que la tiene abierta.`,
            "",
            "  Casi siempre es el servidor de desarrollo. Turbopack vigila la",
            "  carpeta del proyecto completa y bloquea .open-next, que es justo",
            "  la que el build necesita regenerar.",
            "",
            "  Que hacer:",
            "",
            "    1. Ctrl+C en la terminal donde corre  bun dev",
            "    2. Ctrl+C en la de  npx convex dev    (recomendado)",
            "    3. Vuelve a lanzar el despliegue",
            "",
        ].join("\n"),
    );
    process.exit(1);
}
