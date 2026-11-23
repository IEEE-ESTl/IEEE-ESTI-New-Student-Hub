"use client"

import { useMemo, useState } from "react"
import { BlurFade } from "./magicui/blur-fade"
import { DetalleEvento, TarjetaEvento, useDetalleEvento } from "./eventos/TarjetaEvento"
import { bebasNeue, montserrat } from "@/lib/fonts"
import {
    eventos,
    conteoPorCategoria,
    fechaCorta,
    historialPorAnio,
    type Categoria,
    type Evento,
} from "@/app/data/events"

export default function Events({ categoriaInicial }: { categoriaInicial?: Categoria }) {
    const [categoria, setCategoria] = useState<Categoria | undefined>(categoriaInicial)
    const detalle = useDetalleEvento<Evento>()

    const conteo = useMemo(() => conteoPorCategoria(eventos), [])
    const bloques = useMemo(() => historialPorAnio(eventos, categoria), [categoria])

    /**
     * Cambia el filtro y lo deja escrito en la direccion.
     *
     * Asi un enlace como /events?categoria=taller se puede compartir en redes y
     * abre ya filtrado. Se usa `replaceState` y no una navegacion: cambiar de
     * filtro no es cambiar de pagina, y no deberia llenar el historial del
     * boton "atras".
     */
    const elegir = (nueva: Categoria | undefined) => {
        setCategoria(nueva)
        const url = new URL(window.location.href)
        if (nueva) url.searchParams.set("categoria", nueva.toLowerCase())
        else url.searchParams.delete("categoria")
        window.history.replaceState(null, "", url)
    }

    const chip = (etiqueta: string, total: number, activo: boolean, alElegir: () => void) => (
        <button
            key={etiqueta}
            type="button"
            onClick={alElegir}
            aria-pressed={activo}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activo
                    ? "border-[#0371a4] bg-[#0371a4] text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:border-[#0371a4] hover:text-[#0371a4]"
            }`}
        >
            {etiqueta}
            <span
                className={`rounded-full px-2 py-px text-xs ${
                    activo ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
            >
                {total}
            </span>
        </button>
    )

    // Contador corrido para escalonar la animacion de entrada entre bloques.
    let orden = 0

    return (
        <section className={`${montserrat.className} mb-10 min-h-screen bg-white px-4 sm:px-6 lg:px-8`} id="events">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 text-center">
                    <h1
                        className={`${bebasNeue.className} text-center text-7xl font-bold text-[#0371a4] lg:text-8xl xl:text-9xl`}
                    >
                        Eventos
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Talleres, hackathons y congresos que ha organizado la rama.
                    </p>
                </div>

                {/* Filtros. Se quedan fijos bajo el menu al hacer scroll: con el
                    historial largo, volver arriba para cambiar de categoria
                    estorba. El menu mide 88 px de alto. */}
                <div className="sticky top-[88px] z-30 -mx-4 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
                    <div
                        role="group"
                        aria-label="Filtrar por categoría"
                        className="flex gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden"
                    >
                        {chip("Todos", eventos.length, categoria === undefined, () => elegir(undefined))}
                        {conteo.map(({ categoria: c, total }) =>
                            chip(c, total, categoria === c, () => elegir(c)),
                        )}
                    </div>
                </div>

                {/* Linea de tiempo: lo mas nuevo arriba, agrupado por año */}
                {bloques.map((bloque) => (
                    <section key={bloque.anio} className="mt-11" aria-labelledby={`anio-${bloque.anio}`}>
                        <div className="mb-6 flex items-center gap-4">
                            <h2
                                id={`anio-${bloque.anio}`}
                                className={`${bebasNeue.className} text-5xl leading-none text-[#0371a4] sm:text-6xl`}
                            >
                                {bloque.anio}
                            </h2>
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-[#0371a4]/40 to-transparent" />
                            <span className="whitespace-nowrap text-sm text-gray-500">
                                {bloque.eventos.length} {bloque.eventos.length === 1 ? "evento" : "eventos"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {bloque.eventos.map((event) => (
                                <BlurFade
                                    // La categoria va en la clave para que, al
                                    // filtrar, las tarjetas vuelvan a entrar animadas.
                                    key={`${categoria ?? "todos"}-${event.id}`}
                                    delay={Math.min(orden++, 8) * 0.05}
                                    inView
                                    className="h-full"
                                >
                                    <TarjetaEvento
                                        evento={event}
                                        // Sin año: las tarjetas ya estan bajo el suyo.
                                        fecha={fechaCorta(event)}
                                        onAbrir={() => detalle.abrir(event)}
                                    />
                                </BlurFade>
                            ))}
                        </div>
                    </section>
                ))}

                <DetalleEvento evento={detalle.evento} visible={detalle.visible} onCerrar={detalle.cerrar} />
            </div>
        </section>
    )
}
