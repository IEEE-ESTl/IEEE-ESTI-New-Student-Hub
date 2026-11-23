import Events from "@/components/Events";
import { categoriaDesdeParametro } from "@/app/data/events";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "IEEE ESTl | Eventos",
    description:
        "Historial de talleres, hackatones, congresos y conferencias organizados por la Rama Estudiantil IEEE - ESTl.",
};

export default async function EventsPage({
    searchParams,
}: {
    searchParams: Promise<{ categoria?: string | string[] }>;
}) {
    // La categoria se lee aqui, en el servidor, y no despues en el navegador:
    // quien abre un enlace como /events?categoria=taller recibe la pagina ya
    // filtrada, sin ver primero todos los eventos y luego como desaparecen.
    const { categoria } = await searchParams;
    const valor = Array.isArray(categoria) ? categoria[0] : categoria;

    return (
        <main className="pt-28">
            <Events categoriaInicial={categoriaDesdeParametro(valor)} />
        </main>
    );
}
