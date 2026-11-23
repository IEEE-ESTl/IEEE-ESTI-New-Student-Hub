"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { BlurFade } from "./magicui/blur-fade"
import { DetalleEvento, TarjetaEvento, useDetalleEvento } from "./eventos/TarjetaEvento"
import { bebasNeue, montserrat } from "@/lib/fonts"
import {
    aceptaInscripciones,
    proximosOrdenados,
    registroVigente,
    rutaDeRegistro,
    type Proximo,
} from "@/app/data/comingSoon"
import { fechaLegible } from "@/app/data/events"

/** Aviso en la tarjeta de que el evento acepta inscripciones. */
function InscripcionesAbiertas() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
            Inscripciones abiertas
        </span>
    )
}

/**
 * El boton de inscripcion del detalle.
 *
 * Dos caminos, y el orden importa:
 *
 *   1. `registerLink` gana si existe. Si alguien lo escribio es porque la
 *      inscripcion vive fuera del sitio (otra institucion, un patrocinador).
 *      Ojo: esos datos NO llegan al dashboard.
 *   2. Si no, y el registro esta vigente, se enlaza al formulario propio. La
 *      ruta la decide la categoria: talleres a /register-workshop, lo demas a
 *      /register-event.
 *
 * Sin ninguno de los dos, no hay boton: el evento esta anunciado pero todavia
 * no acepta inscripciones.
 */
function BotonInscripcion({ evento }: { evento: Proximo }) {
    const clases = "mt-6 w-full cursor-pointer bg-[#0371a4] text-white hover:bg-[#0371a4]/80"

    if (evento.registerLink) {
        return (
            <Button asChild className={clases}>
                <a href={evento.registerLink} target="_blank" rel="noopener noreferrer">
                    Regístrate aquí
                    <ExternalLink className="ml-1 h-4 w-4" />
                </a>
            </Button>
        )
    }

    if (registroVigente(evento)) {
        return (
            <Button asChild className={clases}>
                <Link href={rutaDeRegistro(evento)}>Regístrate aquí</Link>
            </Button>
        )
    }

    return null
}

export default function ComingSoon() {
    const detalle = useDetalleEvento<Proximo>()
    const lista = proximosOrdenados()

    return (
        <section className={`${montserrat.className} min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8`} id="coming-soon">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 text-center">
                    <h1
                        className={`${bebasNeue.className} text-center text-7xl font-bold text-[#0371a4] lg:text-8xl xl:text-9xl`}
                    >
                        Próximamente
                    </h1>
                    <p className="mt-2 text-gray-500">Lo que viene, del más cercano al más lejano.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {lista.map((evento, i) => (
                        <BlurFade key={evento.id} delay={Math.min(i, 8) * 0.05} inView className="h-full">
                            <TarjetaEvento
                                evento={evento}
                                // Completa, con año: aqui no hay agrupacion por año que lo
                                // de por sentado, y para planear importa.
                                fecha={fechaLegible(evento)}
                                onAbrir={() => detalle.abrir(evento)}
                                distintivo={aceptaInscripciones(evento) ? <InscripcionesAbiertas /> : undefined}
                            />
                        </BlurFade>
                    ))}
                </div>

                <DetalleEvento evento={detalle.evento} visible={detalle.visible} onCerrar={detalle.cerrar}>
                    {detalle.evento && <BotonInscripcion evento={detalle.evento} />}
                </DetalleEvento>
            </div>
        </section>
    )
}
