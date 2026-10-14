"use client"

import { useEffect, useMemo, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Download,
    Loader2,
    Search,
    Sheet,
    Trash2,
} from "lucide-react"
import { useAction, useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "../../../convex/_generated/api"
import { montserrat } from "@/lib/fonts"

export type Columna<T> = {
    /** Encabezado visible. */
    titulo: string
    /** Como sacar el valor de la fila. Devolver texto plano. */
    valor: (fila: T) => string
    /** Si es false, la columna no se puede ordenar. Por defecto se puede. */
    ordenable?: boolean
}

/** Tablas que el panel puede vaciar. Debe coincidir con `admin.limpiar`. */
export type TablaLimpiable =
    | "workshopRegistrations"
    | "eventRegistrations"
    | "joinRequests"
    | "studentInterests"

/**
 * Como agrupar las filas: por taller, por evento.
 *
 * Se trabaja con el valor guardado (el identificador) y no con el texto de la
 * columna, porque ese mismo valor es el que se le manda al servidor para
 * borrar. Si el filtro mostrara una cosa y se borrara otra, el error seria
 * irreversible.
 */
export type Grupo<T> = {
    /** Como se llama lo que agrupa, en minusculas: "taller", "evento". */
    etiqueta: string
    /** El plural, escrito a mano: en español no basta con agregar una "s". */
    plural: string
    /** Identificador guardado en la base. */
    valorDe: (fila: T) => string
    /** Titulo legible de ese identificador, para el menu y los avisos. */
    nombreDe: (valor: string) => string
}

type Props<T> = {
    filas: T[] | undefined
    columnas: Columna<T>[]
    /** Nombre base del archivo CSV, sin extension. */
    nombreArchivo: string
    /** Nombre de la pestana donde se escribe en Google Sheets. */
    pestana: string
    /** Que decir cuando no hay ni una fila. */
    vacio: string
    /** Tabla de Convex que vacia el boton de limpiar. */
    tabla: TablaLimpiable
    /** Si se puede filtrar por taller o evento. */
    grupo?: Grupo<T>
}

const POR_PAGINA = 15

/** Lo que hay que escribir para confirmar un borrado. */
const PALABRA_CONFIRMACION = "BORRAR"

type Aviso = { tipo: "ok" | "error"; texto: string; url?: string }

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

/** Quita acentos y signos para que sirva de nombre de archivo. */
function parteDeArchivo(texto: string): string {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50)
}

export default function TablaDatos<T>({
    filas,
    columnas,
    nombreArchivo,
    pestana,
    vacio,
    tabla,
    grupo,
}: Props<T>) {
    const [busqueda, setBusqueda] = useState("")
    const [seleccion, setSeleccion] = useState("")
    const [orden, setOrden] = useState<{ indice: number; asc: boolean } | null>(null)
    const [pagina, setPagina] = useState(0)
    const [enviando, setEnviando] = useState(false)
    const [aviso, setAviso] = useState<Aviso | null>(null)

    const [confirmando, setConfirmando] = useState(false)
    const [palabra, setPalabra] = useState("")
    const [borrando, setBorrando] = useState(false)

    const exportarAHoja = useAction(api.googleSheets.exportar)
    const limpiarTabla = useMutation(api.admin.limpiar)

    // Se precalculan los textos de cada celda una sola vez: los usan la
    // busqueda, el ordenamiento, el render y la exportacion.
    const textos = useMemo(
        () => (filas ?? []).map((fila) => columnas.map((columna) => columna.valor(fila))),
        [filas, columnas],
    )

    /** Identificador de taller/evento de cada fila, en el orden de `filas`. */
    const valores = useMemo(
        () => (grupo ? (filas ?? []).map(grupo.valorDe) : []),
        [filas, grupo],
    )

    /** Las opciones del menu: solo los talleres que de verdad tienen registros. */
    const opcionesGrupo = useMemo(() => {
        if (!grupo) return []
        const cuenta = new Map<string, number>()
        for (const valor of valores) {
            cuenta.set(valor, (cuenta.get(valor) ?? 0) + 1)
        }
        return [...cuenta.entries()]
            .map(([valor, total]) => ({ valor, total, nombre: grupo.nombreDe(valor) }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    }, [valores, grupo])

    // Si el taller seleccionado se queda sin registros —porque se acaban de
    // borrar— el filtro volveria a una vista vacia sin explicacion. Se regresa
    // solo a "todos".
    useEffect(() => {
        if (seleccion && !opcionesGrupo.some((o) => o.valor === seleccion)) {
            setSeleccion("")
        }
    }, [opcionesGrupo, seleccion])

    /** Filas del grupo elegido, sin tomar en cuenta la busqueda. */
    const delGrupo = useMemo(() => {
        const indices = textos.map((_, i) => i)
        if (!seleccion) return indices
        return indices.filter((i) => valores[i] === seleccion)
    }, [textos, valores, seleccion])

    const filtradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()
        if (!termino) return delGrupo
        return delGrupo.filter((i) =>
            textos[i].some((celda) => celda.toLowerCase().includes(termino)),
        )
    }, [delGrupo, textos, busqueda])

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

    /** Nombre legible de lo que hay filtrado ahora mismo. */
    const nombreSeleccion = seleccion && grupo ? grupo.nombreDe(seleccion) : null

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
     * nada extra a Convex. Exporta lo que el filtro y la busqueda dejaron
     * visible, no solo la pagina actual, que es lo que uno espera al filtrar y
     * luego exportar.
     */
    const exportar = () => {
        const encabezados = columnas.map((c) => escaparCsv(c.titulo)).join(",")
        const cuerpo = ordenadas.map((i) => textos[i].map(escaparCsv).join(",")).join("\n")

        // El BOM hace que Excel abra el archivo como UTF-8. Sin el, los acentos
        // se ven como simbolos raros.
        const contenido = "﻿" + encabezados + "\n" + cuerpo

        // El nombre lleva el taller cuando hay filtro, para no terminar con
        // cuatro archivos llamados igual en la carpeta de descargas.
        const sufijo = nombreSeleccion ? `-${parteDeArchivo(nombreSeleccion)}` : ""

        const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8;" }))
        const enlace = document.createElement("a")
        enlace.href = url
        enlace.download = `${nombreArchivo}${sufijo}-${new Date().toISOString().slice(0, 10)}.csv`
        enlace.click()
        URL.revokeObjectURL(url)
    }

    /**
     * Manda a Google Sheets lo mismo que se ve en pantalla.
     *
     * Las filas se arman aqui y viajan ya formateadas: asi la hoja refleja
     * exactamente las columnas del panel, sin definirlas por segunda vez en el
     * servidor donde se podrian desincronizar.
     */
    const aSheets = async () => {
        setEnviando(true)
        setAviso(null)
        try {
            // Cada taller va a su propia pestana. Con un nombre fijo, exportar
            // un taller y luego otro sobrescribia el primero.
            const destino = nombreSeleccion ? `${pestana} — ${nombreSeleccion}` : pestana

            const resultado = await exportarAHoja({
                pestana: destino,
                filas: [columnas.map((c) => c.titulo), ...ordenadas.map((i) => textos[i])],
            })
            setAviso({
                tipo: "ok",
                texto: `${resultado.filas} registros enviados a la hoja.`,
                url: resultado.url,
            })
        } catch (fallo) {
            console.error("Error al exportar a Sheets:", fallo)
            const mensaje = fallo instanceof Error ? fallo.message : ""
            const limpio = mensaje.split("Uncaught Error:").pop()?.split(String.fromCharCode(10))[0]?.trim()
            setAviso({
                tipo: "error",
                texto: limpio && limpio.length < 300 ? limpio : "No se pudo exportar a la hoja.",
            })
        } finally {
            setEnviando(false)
        }
    }

    /**
     * Borra los registros del grupo seleccionado, o toda la tabla si no hay
     * filtro puesto.
     *
     * Se llama en ciclo porque el servidor borra por lotes: una sola llamada
     * podria pasarse del tope de una transaccion de Convex.
     */
    const borrar = async () => {
        setBorrando(true)
        setAviso(null)
        try {
            let total = 0
            for (;;) {
                const resultado = await limpiarTabla({
                    tabla,
                    valor: seleccion || undefined,
                })
                total += resultado.borrados
                if (!resultado.hayMas) break
            }

            setAviso({
                tipo: "ok",
                texto: `${total} ${total === 1 ? "registro borrado" : "registros borrados"}.`,
            })
            setConfirmando(false)
            setPalabra("")
            setPagina(0)
        } catch (fallo) {
            console.error("Error al borrar:", fallo)
            const motivo = fallo instanceof ConvexError ? String(fallo.data) : null
            setAviso({ tipo: "error", texto: motivo ?? "No se pudieron borrar los registros." })
        } finally {
            setBorrando(false)
        }
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
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

                    {grupo && opcionesGrupo.length > 0 && (
                        <Select
                            value={seleccion || "todos"}
                            onValueChange={(valor) => {
                                setSeleccion(valor === "todos" ? "" : valor)
                                setPagina(0)
                            }}
                        >
                            <SelectTrigger
                                className="w-full sm:w-72"
                                aria-label={`Filtrar por ${grupo.etiqueta}`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">
                                    Todos los {grupo.plural}
                                </SelectItem>
                                {opcionesGrupo.map((opcion) => (
                                    <SelectItem key={opcion.valor} value={opcion.valor}>
                                        {opcion.nombre} ({opcion.total})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
                    <Button
                        type="button"
                        onClick={aSheets}
                        disabled={ordenadas.length === 0 || enviando}
                        className="cursor-pointer bg-[#0371a4] text-white hover:bg-[#0371a4]/80"
                    >
                        {enviando ? (
                            <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Enviando…
                            </>
                        ) : (
                            <>
                                <Sheet className="mr-1 h-4 w-4" />
                                Sheets
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setPalabra("")
                            setConfirmando(true)
                        }}
                        disabled={delGrupo.length === 0}
                        className="cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Limpiar
                    </Button>
                </div>
            </div>

            {aviso && (
                <div
                    className={`mb-4 rounded-md border p-3 text-sm ${
                        aviso.tipo === "ok"
                            ? "border-[#0371a4]/40 bg-[#0371a4]/10 text-[#0371a4]"
                            : "border-destructive/50 bg-destructive/10 text-destructive"
                    }`}
                >
                    {aviso.texto}{" "}
                    {aviso.url && (
                        <a
                            href={aviso.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                        >
                            Abrir la hoja
                        </a>
                    )}
                </div>
            )}

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
                                    {busqueda || seleccion
                                        ? "Ningún registro coincide con el filtro."
                                        : vacio}
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

            <Dialog open={confirmando} onOpenChange={(abierto) => !borrando && setConfirmando(abierto)}>
                <DialogContent className={montserrat.className}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Borrar registros
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-3 pt-2 text-left">
                                <p>
                                    Se van a borrar{" "}
                                    <strong className="text-foreground">
                                        {delGrupo.length}{" "}
                                        {delGrupo.length === 1 ? "registro" : "registros"}
                                    </strong>{" "}
                                    {nombreSeleccion ? (
                                        <>
                                            de{" "}
                                            <strong className="text-foreground">
                                                «{nombreSeleccion}»
                                            </strong>
                                            .
                                        </>
                                    ) : (
                                        <>
                                            de <strong className="text-foreground">toda la tabla</strong>.
                                        </>
                                    )}
                                </p>

                                {/* La busqueda estrecha lo que se ve, no lo que se
                                    borra. Sin decirlo, alguien que busca un nombre
                                    y ve una fila puede creer que borra solo esa. */}
                                {busqueda.trim() && (
                                    <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive">
                                        La búsqueda «{busqueda.trim()}» no limita el borrado: se
                                        borran los {delGrupo.length} registros, no los{" "}
                                        {ordenadas.length} que estás viendo.
                                    </p>
                                )}

                                <p>
                                    Esto no se puede deshacer. Si todavía no has exportado estos
                                    datos, cancela y descárgalos primero.
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="confirmacion">
                            Escribe <strong>{PALABRA_CONFIRMACION}</strong> para confirmar
                        </Label>
                        <Input
                            id="confirmacion"
                            value={palabra}
                            onChange={(e) => setPalabra(e.target.value)}
                            placeholder={PALABRA_CONFIRMACION}
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmando(false)}
                            disabled={borrando}
                            className="cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={borrar}
                            disabled={palabra.trim() !== PALABRA_CONFIRMACION || borrando}
                            className="cursor-pointer bg-destructive text-white hover:bg-destructive/80"
                        >
                            {borrando ? (
                                <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Borrando…
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Borrar
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
