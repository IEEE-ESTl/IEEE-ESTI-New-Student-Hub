"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    throw new Error(
        "Falta NEXT_PUBLIC_CONVEX_URL. Corre `bunx convex dev` para generarla en .env.local, " +
        "o cárgala en las variables de entorno del despliegue. Ver .env.example.",
    );
}

const convex = new ConvexReactClient(convexUrl);

/**
 * Envuelve toda la app.
 *
 * Usa `ConvexAuthNextjsProvider` en lugar del `ConvexProvider` a secas porque
 * el dashboard necesita sesion. Las paginas publicas funcionan igual: los
 * formularios de los alumnos no piden autenticacion.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
}
