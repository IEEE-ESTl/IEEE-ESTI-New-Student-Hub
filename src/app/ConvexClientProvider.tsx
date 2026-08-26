"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    throw new Error(
        "Falta NEXT_PUBLIC_CONVEX_URL. Corre `bunx convex dev` para generarla en .env.local, " +
        "o cárgala en las variables de entorno del despliegue. Ver .env.example.",
    );
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
