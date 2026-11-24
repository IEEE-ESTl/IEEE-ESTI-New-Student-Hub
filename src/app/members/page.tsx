// src/app/members/page.tsx
import { bebasNeue } from "@/lib/fonts";
import { members } from "../data/members";
import { exMembers } from "../data/exMembers";
import TarjetaMiembro, { type Miembro } from "@/components/TarjetaMiembro";
import { FONDO_COMITE, FONDO_ICONOS } from "@/components/fondosMiembros";
import { BlurFade } from "@/components/magicui/blur-fade";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "IEEE ESTl | Miembros",
    description: "IEEE ESTl | Miembros",
};

function Seccion({ titulo, lista, fondo }: { titulo: string; lista: Miembro[]; fondo: string }) {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <h1 className={`${bebasNeue.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#0371a4] text-center mb-8 mt-14 sm:mb-12 lg:mb-16`}>
                {titulo}
            </h1>
            {/* La tarjeta mide hasta 340 px y se encoge si la columna es mas
                angosta. `justify-items-center` la centra cuando sobra espacio. */}
            <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8">
                {lista.map((miembro, idx) => (
                    <BlurFade
                        delay={0.15 + idx * 0.05}
                        inView
                        key={miembro.name}
                        className="w-full max-w-[340px]"
                    >
                        <TarjetaMiembro miembro={miembro} fondo={fondo} />
                    </BlurFade>
                ))}
            </div>
        </div>
    );
}

export default function Members() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <Seccion titulo="Comité-Directivo" lista={members} fondo={FONDO_COMITE} />
            <Seccion titulo="Iconos" lista={exMembers} fondo={FONDO_ICONOS} />
        </main>
    )
}
