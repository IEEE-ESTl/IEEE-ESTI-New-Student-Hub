"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { ArrowRight, Calendar, MapPin, User, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { jetBrainsMono, montserrat } from "@/lib/fonts"
import { COLOR_CATEGORIA, fechaLegible, type Evento } from "@/app/data/events"

/**
 * Piezas compartidas por el historial (/events) y por Próximamente.
 *
 * Antes cada pagina tenia su propia copia de la tarjeta y del detalle, y en
 * cuanto se rediseño una, la otra se quedo con el diseño viejo. Viven aqui para
 * que un cambio llegue a las dos.
 */

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
export function Flyer({ evento, className = "" }: { evento: Evento; className?: string }) {
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

/**
 * La tarjeta de un evento.
 *
 * Es un boton y no un div con onClick: asi se abre tambien con el teclado.
 *
 * `fecha` se recibe ya escrita porque cada pagina la muestra distinto: el
 * historial en corto y sin año (ya estan agrupados por año), Próximamente
 * completa. `distintivo` es para avisos propios de cada pagina, como
 * "Inscripciones abiertas".
 */
export function TarjetaEvento({
    evento,
    fecha,
    onAbrir,
    distintivo,
}: {
    evento: Evento
    fecha: string
    onAbrir: () => void
    distintivo?: ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onAbrir}
            className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0371a4]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0371a4]"
        >
            <Flyer evento={evento} className="aspect-[4/3] w-full" />

            <div className={`${montserrat.className} flex flex-1 flex-col gap-2 p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#0371a4]">
                        <Calendar className="h-3.5 w-3.5" />
                        {fecha}
                    </span>
                    {distintivo}
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
                    {evento.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {evento.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-1.5 text-sm font-semibold text-[#0371a4] transition-all duration-200 group-hover:gap-2">
                    Ver detalles
                    <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </button>
    )
}

/**
 * Estado del detalle: que evento esta abierto y si ya se ve.
 *
 * Son dos cosas separadas para poder animar: al abrir, primero se monta el
 * detalle invisible y un instante despues se hace visible; al cerrar, primero
 * se desvanece y despues se desmonta. Sin esa pausa la transicion no se ve.
 *
 * Tambien se encarga de cerrar con Escape y de bloquear el scroll de la pagina
 * mientras esta abierto.
 */
export function useDetalleEvento<T extends Evento>() {
    const [evento, setEvento] = useState<T | null>(null)
    const [visible, setVisible] = useState(false)

    const abrir = (nuevo: T) => {
        setEvento(nuevo)
        setTimeout(() => setVisible(true), 10)
    }

    const cerrar = useCallback(() => {
        setVisible(false)
        setTimeout(() => setEvento(null), 300)
    }, [])

    useEffect(() => {
        if (!evento) return

        const alPresionar = (e: KeyboardEvent) => {
            if (e.key === "Escape") cerrar()
        }
        document.addEventListener("keydown", alPresionar)
        document.body.style.overflow = "hidden"

        return () => {
            document.removeEventListener("keydown", alPresionar)
            document.body.style.overflow = "unset"
        }
    }, [evento, cerrar])

    return { evento, visible, abrir, cerrar }
}

/**
 * El detalle de un evento: flyer, descripcion completa, fecha, lugar y quien lo
 * imparte. `children` va al final, para lo que cada pagina necesite agregar;
 * Próximamente pone ahi el boton de inscripcion.
 */
export function DetalleEvento({
    evento,
    visible,
    onCerrar,
    children,
}: {
    evento: Evento | null
    visible: boolean
    onCerrar: () => void
    children?: ReactNode
}) {
    if (!evento) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 ${
                visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={onCerrar}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-evento"
                className={`relative grid max-h-[90vh] w-full max-w-4xl transform grid-cols-1 overflow-y-auto rounded-2xl bg-white transition-all duration-300 lg:grid-cols-2 ${
                    visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onCerrar}
                    aria-label="Cerrar"
                    className="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100"
                >
                    <X className="h-5 w-5" />
                </button>

                <Flyer
                    evento={evento}
                    className="h-72 shrink-0 sm:h-96 lg:h-auto lg:min-h-[28rem] lg:rounded-l-2xl"
                />

                <div className={`${montserrat.className} p-8`}>
                    <h2 id="titulo-evento" className="mb-4 pr-8 text-3xl font-bold text-gray-900">
                        {evento.title}
                    </h2>
                    <p className={`${jetBrainsMono.className} mb-6 leading-relaxed text-gray-600`}>
                        {evento.fullDescription}
                    </p>

                    <div className="space-y-4 border-t border-gray-200 pt-5">
                        <div className="flex items-center text-gray-700">
                            <Calendar className="mr-2 h-5 w-5 shrink-0 text-[#0371a4]" />
                            <span className="font-medium">{fechaLegible(evento)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <MapPin className="mr-2 h-5 w-5 shrink-0 text-[#0371a4]" />
                            <span className="font-medium">{evento.location}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <User className="mr-2 h-5 w-5 shrink-0 text-[#0371a4]" />
                            <span className="font-medium">{evento.instructor}</span>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    )
}
