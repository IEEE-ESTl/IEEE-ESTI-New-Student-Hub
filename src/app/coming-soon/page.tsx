import ComingSoon from "@/components/ComingSoon";
import { hayProximosEventos } from "@/app/data/comingSoon";
import { bebasNeue, jetBrainsMono } from "@/lib/fonts";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "IEEE ESTl | Próximamente",
    description:
        "Próximos talleres, hackatones y eventos de la Rama Estudiantil IEEE - ESTl.",
};

export default function ComingSoonPage() {
    // A diferencia del home, esta página existe siempre: alguien que llega por
    // el enlace del Navbar merece una respuesta clara, no un 404.
    if (!hayProximosEventos) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <h1
                    className={`${bebasNeue.className} font-bold text-[#0371a4] text-7xl lg:text-8xl xl:text-9xl`}
                >
                    Próximamente
                </h1>
                <p
                    className={`${jetBrainsMono.className} text-black max-w-xl mt-4 text-sm sm:text-base lg:text-lg`}
                >
                    Por ahora no tenemos eventos anunciados. Estamos preparando lo que sigue.
                    Mientras tanto, puedes revisar todo lo que hemos hecho.
                </p>
                <Link
                    href="/events"
                    className={`${jetBrainsMono.className} mt-8 rounded-full bg-[#0371a4] px-6 py-3 text-white transition-all duration-200 hover:bg-[#0371a4]/80`}
                >
                    Ver eventos pasados
                </Link>
            </main>
        );
    }

    return (
        <main className="pt-28">
            <ComingSoon />
        </main>
    );
}
