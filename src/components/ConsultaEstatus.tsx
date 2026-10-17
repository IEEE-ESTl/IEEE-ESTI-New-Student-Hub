"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle, Loader2, MapPin, Search, User } from "lucide-react"
import { montserrat } from "@/lib/fonts"
import { useConvex } from "convex/react"
import { api } from "../../convex/_generated/api"
import { COLOR_CATEGORIA, type Categoria } from "@/app/data/events"

type Inscripcion = {
    tipo: "Taller" | "Evento"
    titulo: string
    categoria: string
    fecha: string
    lugar: string
    instructor: string
    alumno: string
    grupo: string
    numeroCuenta?: string
    registradoEn: number
    referencia: string
}

type Resultado =
    | { estado: "nada" }
    | { estado: "invalido" }
    | { estado: "sin-registro"; identificador: string }
    | { estado: "encontrado"; inscripciones: Inscripcion[] }

function fechaDeRegistro(ms: number): string {
    return new Date(ms).toLocaleString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export default function ConsultaEstatus() {
    const [identificador, setIdentificador] = useState("")
    const [consultando, setConsultando] = useState(false)
    const [resultado, setResultado] = useState<Resultado>({ estado: "nada" })
    const [errorConsulta, setErrorConsulta] = useState<string | null>(null)

    // Se usa `useConvex().query` y no `useQuery` a proposito: la consulta debe
    // ocurrir cuando el alumno pulsa el boton, no con cada tecla que escribe.
    // Con `useQuery` se dispararia una consulta por cada caracter.
    const convex = useConvex()

    const consultar = async (e: React.FormEvent) => {
        e.preventDefault()

        const valor = identificador.trim()
        if (!valor) return

        setConsultando(true)
        setErrorConsulta(null)

        try {
            const respuesta = await convex.query(api.estatus.consultar, {
                identificador: valor,
            })

            if (!respuesta.valido) {
                setResultado({ estado: "invalido" })
            } else if (respuesta.inscripciones.length === 0) {
                setResultado({ estado: "sin-registro", identificador: valor })
            } else {
                setResultado({ estado: "encontrado", inscripciones: respuesta.inscripciones })
            }
        } catch (fallo) {
            console.error("Error al consultar el estatus:", fallo)
            setErrorConsulta("No pudimos consultar tu estatus. Revisa tu conexión e inténtalo de nuevo.")
        } finally {
            setConsultando(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className={`${montserrat.className} text-xl text-center text-foreground`}>
                        Consulta de inscripción
                    </CardTitle>
                    <p className={`${montserrat.className} text-center text-sm text-muted-foreground`}>
                        Escribe tu número de cuenta o el correo con el que te registraste.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={consultar} className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between gap-3">
                                <Label
                                    htmlFor="identificador"
                                    className={`${montserrat.className} text-sm font-semibold`}
                                >
                                    Identificador
                                </Label>
                                <span
                                    className={`${montserrat.className} shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground`}
                                >
                                    cuenta o correo
                                </span>
                            </div>
                            <Input
                                id="identificador"
                                value={identificador}
                                onChange={(e) => setIdentificador(e.target.value)}
                                placeholder="490123  -  alumno@uaeh.edu.mx"
                                autoComplete="off"
                            />
                        </div>

                        {errorConsulta && (
                            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{errorConsulta}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={consultando || !identificador.trim()}
                            className={`${montserrat.className} w-full cursor-pointer bg-[#0371a4] text-white hover:bg-[#0371a4]/80`}
                        >
                            {consultando ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Consultando…
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Consultar estatus
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {resultado.estado === "invalido" && (
                <Card className="border-t-4 border-destructive shadow-lg">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
                        <h3 className={`${montserrat.className} mb-1 font-semibold`}>
                            Ese identificador no tiene el formato correcto
                        </h3>
                        <p className={`${montserrat.className} text-sm text-muted-foreground`}>
                            Escribe tu número de cuenta completo (6 dígitos) o el correo
                            institucional con el que te inscribiste.
                        </p>
                    </CardContent>
                </Card>
            )}

            {resultado.estado === "sin-registro" && (
                <Card className="shadow-lg">
                    <CardContent className="pt-6 text-center">
                        <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                        <h3 className={`${montserrat.className} mb-1 font-semibold`}>
                            No encontramos ninguna inscripción
                        </h3>
                        <p className={`${montserrat.className} text-sm text-muted-foreground`}>
                            No hay registros a nombre de{" "}
                            <span className="font-medium text-foreground">
                                {resultado.identificador}
                            </span>
                            . Revisa que esté bien escrito: si te inscribiste con otro correo,
                            prueba con tu número de cuenta.
                        </p>
                    </CardContent>
                </Card>
            )}

            {resultado.estado === "encontrado" &&
                resultado.inscripciones.map((inscripcion, i) => (
                    <Card key={inscripcion.referencia} className="border-t-4 border-[#0371a4] shadow-lg">
                        <CardHeader className="pb-3">
                            <div
                                className={`${montserrat.className} flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-muted-foreground`}
                            >
                                <span className="flex items-center gap-1.5 text-[#0371a4]">
                                    <CheckCircle className="h-4 w-4" />
                                    Inscripción confirmada
                                </span>
                                {resultado.inscripciones.length > 1 && (
                                    <span>
                                        {i + 1} de {resultado.inscripciones.length}
                                    </span>
                                )}
                            </div>

                            <p
                                className={`${montserrat.className} pt-1 text-xs uppercase tracking-wide text-muted-foreground`}
                            >
                                {inscripcion.tipo} asignado
                            </p>
                            <CardTitle className={`${montserrat.className} text-lg text-foreground`}>
                                {inscripcion.titulo}
                            </CardTitle>
                            <div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        COLOR_CATEGORIA[inscripcion.categoria as Categoria] ?? ""
                                    }
                                >
                                    {inscripcion.categoria}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className={`${montserrat.className} space-y-4 text-sm`}>
                            <div className="space-y-1.5 text-muted-foreground">
                                {inscripcion.fecha && (
                                    <p className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 shrink-0 text-[#0371a4]" />
                                        {inscripcion.fecha}
                                    </p>
                                )}
                                {inscripcion.lugar && (
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0 text-[#0371a4]" />
                                        {inscripcion.lugar}
                                    </p>
                                )}
                                {inscripcion.instructor && (
                                    <p className="flex items-center gap-2">
                                        <User className="h-4 w-4 shrink-0 text-[#0371a4]" />
                                        {inscripcion.instructor}
                                    </p>
                                )}
                            </div>

                            <dl className="grid grid-cols-2 gap-4 border-t pt-4">
                                {inscripcion.numeroCuenta && (
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Número de cuenta
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {inscripcion.numeroCuenta}
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Grupo
                                    </dt>
                                    <dd className="font-medium text-foreground">{inscripcion.grupo}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Alumno
                                    </dt>
                                    <dd className="font-medium text-foreground">{inscripcion.alumno}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Referencia
                                    </dt>
                                    <dd className="font-mono font-medium text-foreground">
                                        {inscripcion.referencia}
                                    </dd>
                                </div>
                            </dl>

                            <p className="border-t pt-3 text-xs text-muted-foreground">
                                Registrado el {fechaDeRegistro(inscripcion.registradoEn)}
                                {" · "}
                                Este dato refleja tu {inscripcion.tipo.toLowerCase()} actual,
                                incluso si te reasignaron.
                            </p>
                        </CardContent>
                    </Card>
                ))}

            <p className={`${montserrat.className} text-center text-sm`}>
                <Link
                    href="/register-workshop"
                    className="inline-flex items-center gap-1 text-[#0371a4] underline underline-offset-4 transition-all duration-200 hover:gap-2"
                >
                    ¿Aún no te inscribes? Ir al registro
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </p>
        </div>
    )
}
