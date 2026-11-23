"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Calendar, MapPin, User, X } from "lucide-react"
import { Badge } from "./ui/badge"
import { BlurFade } from "./magicui/blur-fade"
import { bebasNeue, jetBrainsMono, montserrat } from "@/lib/fonts"
import {
    eventos,
    COLOR_CATEGORIA,
    conteoPorCategoria,
    fechaCorta,
    fechaLegible,
    historialPorAnio,
    type Categoria,
    type Evento,
} from "@/app/data/events"

/**
 * El flyer completo, sin recortar.
 *
 * Los flyers llegan en formatos muy distintos: horizontales, cuadrados,
 * verticales. Antes se recortaban a una franja fija y en los verticales se
 * perdia casi todo el texto. Ahora la imagen se muestra entera (`object-contain`)
 * sobre una version difuminada de si misma, que rellena el espacio sobrante sin
 * dejar bandas grises.
 *
 * La imagen va en posicion absoluta a proposito: asi no aporta su propia altura
 * y es el contenedor quien la decide. Si no, un flyer vertical en el detalle se
 * estiraba a su tamaño natural, llenaba la pantalla y empujaba la descripcion
 * hasta abajo. Por eso quien use este componente debe darle una altura.
 */
function Flyer({ evento, className = "" }: { evento: Evento; className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
            <div
                aria-hidden
                className="absolute -inset-5 bg-cover bg-center blur-[18px] brightness-[.85] saturate-[1.2]"
                style={{ backgroundImage: `url(${evento.image})` }}
            />
            <img
                src={evento.image}
                alt={evento.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <Badge className={`absolute left-3 top-3 z-10 ${COLOR_CATEGORIA[evento.category]}`}>
                {evento.category}
            </Badge>
        </div>
    )
}

export default function Events({ categoriaInicial }: { categoriaInicial?: Categoria }) {
    const [categoria, setCategoria] = useState<Categoria | undefined>(categoriaInicial)

    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

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

    const openModal = (event: Evento) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
        // Retraso que permite que el modal se muestre animado
        setTimeout(() => {
            setIsAnimating(true)
        }, 10)
    }

    const closeModal = () => {
        setIsAnimating(false)
        setIsClosing(true)
        setTimeout(() => {
            setSelectedEvent(null)
            setIsModalOpen(false)
            setIsClosing(false)
        }, 300)
    }

    // Cerrar modal con la tecla ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal()
            }
        }

        if (isModalOpen) {
            document.addEventListener("keydown", handleEscape)
            // Prevenir el scroll del body cuando el modal está abierto
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isModalOpen])

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
                                    {/* Boton y no un div con onClick: asi la tarjeta
                                        se abre tambien con el teclado. */}
                                    <button
                                        type="button"
                                        onClick={() => openModal(event)}
                                        className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0371a4]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0371a4]"
                                    >
                                        <Flyer evento={event} className="aspect-[4/3] w-full" />

                                        <div className="flex flex-1 flex-col gap-2 p-5">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#0371a4]">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {fechaCorta(event)}
                                            </span>
                                            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
                                                {event.title}
                                            </h3>
                                            <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                                {event.description}
                                            </p>
                                            <span className="mt-auto inline-flex items-center gap-1 pt-1.5 text-sm font-semibold text-[#0371a4] transition-all duration-200 group-hover:gap-2">
                                                Ver detalles
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </button>
                                </BlurFade>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Modal de eventos */}
                {selectedEvent && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 ${
                            isAnimating && !isClosing ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={closeModal}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="titulo-evento"
                            className={`relative grid max-h-[90vh] w-full max-w-4xl transform grid-cols-1 overflow-y-auto rounded-2xl bg-white transition-all duration-300 lg:grid-cols-2 ${
                                isAnimating && !isClosing
                                    ? "translate-y-0 scale-100 opacity-100"
                                    : "translate-y-4 scale-95 opacity-0"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                aria-label="Cerrar"
                                className="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <Flyer
                                evento={selectedEvent}
                                className="h-72 shrink-0 sm:h-96 lg:h-auto lg:min-h-[28rem] lg:rounded-l-2xl"
                            />

                            <div className="p-8">
                                <h2
                                    id="titulo-evento"
                                    className={`${montserrat.className} mb-4 pr-8 text-3xl font-bold text-gray-900`}
                                >
                                    {selectedEvent.title}
                                </h2>
                                <p className={`${jetBrainsMono.className} mb-6 leading-relaxed text-gray-600`}>
                                    {selectedEvent.fullDescription}
                                </p>

                                <div className={`${montserrat.className} space-y-4 border-t border-gray-200 pt-5`}>
                                    <div className="flex items-center text-gray-700">
                                        <Calendar className="mr-2 h-5 w-5 shrink-0 text-[#0371a4]" />
                                        <span className="font-medium">{fechaLegible(selectedEvent)}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <MapPin className="mr-2 h-5 w-5 shrink-0 text-[#0371a4]" />
                                        <span className="font-medium">{selectedEvent.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <User className="mr-2 h-5 w-5 shrink-0 text-[#0371a4]" />
                                        <span className="font-medium">{selectedEvent.instructor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
