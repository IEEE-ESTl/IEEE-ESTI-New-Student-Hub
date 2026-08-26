import { Suspense } from "react";
import FormularioAcceso from "@/components/dashboard/FormularioAcceso";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Acceso | IEEE ESTl",
    // El panel es interno: no debe aparecer en buscadores.
    robots: { index: false, follow: false },
};

export default function AccesoPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-24">
            {/* El formulario lee ?alta=1 con useSearchParams, que exige Suspense. */}
            <Suspense>
                <FormularioAcceso />
            </Suspense>
        </main>
    );
}
