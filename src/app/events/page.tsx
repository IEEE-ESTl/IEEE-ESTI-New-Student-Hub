import Events from "@/components/Events";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "IEEE ESTl | Eventos",
    description:
        "Historial de talleres, hackatones, congresos y conferencias organizados por la Rama Estudiantil IEEE - ESTl.",
};

export default function EventsPage() {
    return (
        <main className="pt-28">
            <Events />
        </main>
    );
}
