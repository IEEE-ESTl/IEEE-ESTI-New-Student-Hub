"use client"

import { useMemo, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search } from "lucide-react"
import { montserrat } from "@/lib/fonts"

export type Columna<T> = {
    /** Encabezado visible. */
    titulo: string
    /** Como sacar el valor de la fila. Devolver texto plano. */
    valor: (fila: T) => string
    /** Si es false, la columna no se puede ordenar. Por defecto se puede. */
    ordenable?: boolean
}

type Props<T> = {
    filas: T[] | undefined
    columnas: Columna<T>[]
    /** Nombre base del archivo CSV, sin extension. */
    nombreArchivo: string
    /** Que decir cuando no hay ni una fila. */
    vacio: string
}

const POR_PAGINA = 15

/**
 * Escapa un campo para CSV.
 *
 * Necesario de verdad: las respuestas de texto libre ("¿Que te mueres por
 * aprender?") traen comas, comillas y saltos de linea, que es exactamente lo
 * que descuadra las columnas al abrir el archivo en Excel.
 */
function escaparCsv(valor: string): string {
    if (/[",\n\r]/.test(valor)) {
        return `"${valor.replace(/"/g, '""')}"`
    }
    return valor
}

export default function TablaDatos<T>({ filas, columnas, nombreArchivo, vacio }: Props<T>) {
    const [busqueda, setBusqueda] = useState("")
    const [orden, setOrden] = useState<{ indice: number; asc: boolean } | null>(null)
    const [pagina, setPagina] = useState(0)

    // Se precalculan los textos de cada celda una sola vez: los usan la
    // busqueda, el ordenamiento, el render y la exportacion.
    const textos = useMemo(
        () => (filas ?? []).map((fila) => columnas.map((columna) => columna.valor(fila))),
        [filas, columnas],
    )

    const filtradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()
        const indices = textos.map((_, i) => i)
        if (!termino) return indices
        return indices.filter((i) =>
            textos[i].some((celda) => celda.toLowerCase().includes(termino)),
        )
    }, [textos, busqueda])

    const ordenadas = useMemo(() => {
        if (!orden) return filtradas
        return [...filtradas].sort((a, b) => {
            const comparacion = textos[a][orden.indice].localeCompare(
                textos[b][orden.indice],
                "es",
                { numeric: true },
            )
            return orden.asc ? comparacion : -comparacion
        })
    }, [filtradas, orden, textos])

    const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA))
    const paginaSegura = Math.min(pagina, totalPaginas - 1)
    const visibles = ordenadas.slice(paginaSegura * POR_PAGINA, (paginaSegura + 1) * POR_PAGINA)

    const alternarOrden = (indice: number) => {
        setPagina(0)
        setOrden((actual) =>
            actual?.indice === indice
                ? actual.asc
                    ? { indice, asc: false }
                    : null
                : { indice, asc: true },
        )
    }

    /**
     * Genera el CSV en el navegador con los datos ya cargados: no se le pide
     * nada extra a Convex. Exporta lo que la busqueda dejo visible, no solo la
     * pagina actual, que es lo que uno espera al filtrar y luego exportar.
     */
    const exportar = () => {
        const encabezados = columnas.map((c) => escaparCsv(c.titulo)).join(",")
        const cuerpo = ordenadas.map((i) => textos[i].map(escaparCsv).join(",")).join("\n")

        // El BOM hace que Excel abra el archivo como UTF-8. Sin el, los acentos
        // se ven como simbolos raros.
        const contenido = "﻿" + encabezados + "\n" + cuerpo

        const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8;" }))
        const enlace = document.createElement("a")
        enlace.href = url
        enlace.download = `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`
        enlace.click()
        URL.revokeObjectURL(url)
    }

    if (filas === undefined) {
        return (
            <p className={`${montserrat.className} py-12 text-center text-muted-foreground`}>
                Cargando…
            </p>
        )
    }

    return (
        <div className={montserrat.className}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value)
                            setPagina(0)
                        }}
                        placeholder="Buscar…"
                        className="pl-9"
                        aria-label="Buscar en la tabla"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        {ordenadas.length}{" "}
                        {ordenadas.length === 1 ? "registro" : "registros"}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={exportar}
                        disabled={ordenadas.length === 0}
                        className="cursor-pointer"
                    >
                        <Download className="mr-1 h-4 w-4" />
                        CSV
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columnas.map((columna, indice) => {
                                const ordenable = columna.ordenable !== false
                                const activa = orden?.indice === indice
                                return (
                                    <TableHead key={columna.titulo} className="whitespace-nowrap">
                                        {ordenable ? (
                                            <button
                                                type="button"
                                                onClick={() => alternarOrden(indice)}
                                                className="flex cursor-pointer items-center gap-1 font-medium hover:text-[#0371a4]"
                                            >
                                                {columna.titulo}
                                                {activa ? (
                                                    orden.asc ? (
                                                        <ArrowUp className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowDown className="h-3 w-3" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                                                )}
                                            </button>
                                        ) : (
                                            columna.titulo
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {visibles.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnas.length}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    {busqueda ? "Ningún registro coincide con la búsqueda." : vacio}
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibles.map((indiceFila) => (
                                <TableRow key={indiceFila}>
                                    {textos[indiceFila].map((celda, i) => (
                                        <TableCell
                                            key={i}
                                            className="max-w-xs align-top whitespace-pre-wrap break-words"
                                        >
                                            {celda || "—"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Página {paginaSegura + 1} de {totalPaginas}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPagina((p) => Math.max(0, p - 1))}
                            disabled={paginaSegura === 0}
                            className="cursor-pointer"
                        >
                            Anterior
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                            disabled={paginaSegura >= totalPaginas - 1}
                            className="cursor-pointer"
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
