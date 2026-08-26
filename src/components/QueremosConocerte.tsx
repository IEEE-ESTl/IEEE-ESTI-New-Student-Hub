"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "motion/react"
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Send } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { bebasNeue, jetBrainsMono, montserrat } from "@/lib/fonts"
import { cn } from "@/lib/utils"

// Marca local que evita el reenvío accidental. No es la barrera real contra
// duplicados: esa vive en la mutation de Convex, que compara nombre + grupo.
const CLAVE_LOCAL = "ieee-estl:queremos-conocerte-respondido"

const INTERESES = [
    { valor: "inteligencia-artificial", etiqueta: "Inteligencia Artificial" },
    { valor: "videojuegos", etiqueta: "Videojuegos" },
    { valor: "ciberseguridad", etiqueta: "Ciberseguridad" },
    { valor: "desarrollo-movil", etiqueta: "Desarrollo Móvil" },
    { valor: "desarrollo-web", etiqueta: "Desarrollo Web" },
    { valor: "diseno-ui-ux", etiqueta: "Diseño UI/UX" },
    { valor: "backend", etiqueta: "Backend" },
    { valor: "analisis-de-datos", etiqueta: "Análisis de Datos" },
    { valor: "bases-de-datos", etiqueta: "Bases de Datos" },
] as const

const NIVELES = [
    { valor: "empezando", etiqueta: "Empezando", ayuda: "Apenas voy conociendo" },
    { valor: "intermedio", etiqueta: "Intermedio", ayuda: "Ya hago mis propios proyectos" },
    { valor: "avanzado", etiqueta: "Avanzado", ayuda: "Me muevo con soltura" },
] as const

const FORMATOS = [
    { valor: "talleres-practicos", etiqueta: "Talleres prácticos" },
    { valor: "charlas-de-expertos", etiqueta: "Charlas de expertos" },
    { valor: "networking", etiqueta: "Reuniones sociales / Networking" },
    { valor: "hackathons", etiqueta: "Hackathons / Competencias" },
] as const

const INDUSTRIAS = [
    { valor: "gaming", etiqueta: "Gaming" },
    { valor: "enterprise-software", etiqueta: "Enterprise Software" },
    { valor: "media-streaming", etiqueta: "Media / Streaming" },
    { valor: "hardware-iot", etiqueta: "Hardware / IoT" },
    { valor: "fintech", etiqueta: "Fintech" },
    { valor: "cloud", etiqueta: "Cloud" },
    { valor: "open-source", etiqueta: "Open Source" },
    { valor: "e-commerce", etiqueta: "E-Commerce" },
    { valor: "tecnologias-comunitarias", etiqueta: "Tecnologías Comunitarias" },
    { valor: "data-science-ai", etiqueta: "Data Science / AI" },
] as const

/**
 * Extrae los `valor` de una lista de opciones conservando sus tipos literales.
 * Sin el tipo de retorno explícito, TypeScript los ensancharía a `string` y se
 * perdería la garantía de que solo se envían valores que el esquema de Convex
 * acepta.
 */
const valores = <T extends readonly { valor: string }[]>(
    opciones: T,
): [T[number]["valor"], ...T[number]["valor"][]] =>
    opciones.map((o) => o.valor) as [T[number]["valor"], ...T[number]["valor"][]]

const esquema = z.object({
    nombreCompleto: z
        .string()
        .min(3, "El nombre completo debe tener al menos 3 caracteres")
        .max(100, "El nombre completo no puede exceder 100 caracteres"),
    grupoSemestre: z
        .string()
        .min(1, "Dinos tu grupo o semestre")
        .max(50, "Máximo 50 caracteres"),
    interesesTecnologicos: z
        .array(z.enum(valores(INTERESES)))
        .min(1, "Elige al menos un área"),
    nivelExperiencia: z.enum(valores(NIVELES), {
        message: "Elige tu nivel",
    }),
    formatoEventos: z
        .array(z.enum(valores(FORMATOS)))
        .min(1, "Elige al menos un formato"),
    industriaCuriosidad: z
        .array(z.enum(valores(INDUSTRIAS)))
        .min(1, "Elige al menos una industria"),
    metaSemestre: z
        .string()
        .min(5, "Cuéntanos un poco más")
        .max(500, "Máximo 500 caracteres"),
})

type Respuestas = z.infer<typeof esquema>

type Paso = {
    titulo: string
    pregunta: string
    campos: (keyof Respuestas)[]
}

const PASOS: Paso[] = [
    {
        titulo: "Sobre ti",
        pregunta: "Primero, cuéntanos sobre ti. Queremos saber a quién estamos escuchando.",
        campos: ["nombreCompleto", "grupoSemestre"],
    },
    {
        titulo: "Intereses",
        pregunta: "¿Qué área te emociona más?",
        campos: ["interesesTecnologicos"],
    },
    {
        titulo: "Experiencia",
        pregunta: "¿Qué tanto has programado?",
        campos: ["nivelExperiencia"],
    },
    {
        titulo: "Eventos",
        pregunta: "¿Qué tipo de evento sí te haría quedarte después de clases?",
        campos: ["formatoEventos"],
    },
    {
        titulo: "Industria",
        pregunta: "¿Qué industria te da más curiosidad?",
        campos: ["industriaCuriosidad"],
    },
    {
        titulo: "Tu meta",
        pregunta: "¿Qué te mueres por aprender este semestre?",
        campos: ["metaSemestre"],
    },
]

/** Botón tipo chip que se enciende al seleccionarse. */
function Opcion({
    activo,
    onClick,
    children,
}: {
    activo: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={activo}
            className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all duration-200 cursor-pointer text-left",
                activo
                    ? "border-[#0371a4] bg-[#0371a4] text-white shadow-sm"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-[#0371a4] hover:text-[#0371a4]",
            )}
        >
            {children}
        </button>
    )
}

export default function QueremosConocerte() {
    const [paso, setPaso] = useState(0)
    const [enviado, setEnviado] = useState(false)
    const [yaRespondio, setYaRespondio] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

    const responder = useMutation(api.studentInterests.responder)

    const form = useForm<Respuestas>({
        resolver: zodResolver(esquema),
        defaultValues: {
            nombreCompleto: "",
            grupoSemestre: "",
            interesesTecnologicos: [],
            nivelExperiencia: undefined,
            formatoEventos: [],
            industriaCuriosidad: [],
            metaSemestre: "",
        },
        mode: "onChange",
    })

    // `localStorage` no existe durante el render en el servidor, y puede lanzar
    // si el navegador tiene bloqueado el almacenamiento. Por eso va en un efecto
    // y envuelto en try/catch.
    useEffect(() => {
        try {
            if (window.localStorage.getItem(CLAVE_LOCAL) === "1") {
                setYaRespondio(true)
            }
        } catch {
            // Sin almacenamiento disponible: se muestra el formulario normal.
        }
    }, [])

    const alternar = (campo: "interesesTecnologicos" | "formatoEventos" | "industriaCuriosidad", valor: string) => {
        const actuales = form.getValues(campo) as string[]
        const siguientes = actuales.includes(valor)
            ? actuales.filter((v) => v !== valor)
            : [...actuales, valor]
        form.setValue(campo, siguientes as never, { shouldValidate: true })
    }

    const siguiente = async () => {
        const valido = await form.trigger(PASOS[paso].campos)
        if (valido) setPaso((p) => Math.min(p + 1, PASOS.length - 1))
    }

    const anterior = () => setPaso((p) => Math.max(p - 1, 0))

    const onSubmit = async (datos: Respuestas) => {
        setErrorEnvio(null)
        try {
            await responder(datos)
            try {
                window.localStorage.setItem(CLAVE_LOCAL, "1")
            } catch {
                // Si no se puede guardar la marca, no pasa nada: la mutation
                // seguirá rechazando un segundo envío con el mismo nombre y grupo.
            }
            setEnviado(true)
        } catch (error) {
            // La mutation devuelve mensajes pensados para el alumno (por ejemplo,
            // el de respuesta duplicada), así que se muestran tal cual.
            const mensaje = error instanceof Error ? error.message : ""
            const limpio = mensaje.split("Uncaught Error:").pop()?.split("\n")[0]?.trim()
            setErrorEnvio(
                limpio && limpio.length > 0 && limpio.length < 200
                    ? limpio
                    : "No pudimos guardar tus respuestas. Revisa tu conexión e inténtalo de nuevo.",
            )
        }
    }

    const encabezado = (
        <div className="text-center mb-8">
            <h1 className={`${bebasNeue.className} text-7xl lg:text-8xl xl:text-9xl font-bold text-[#0371a4]`}>
                Queremos Conocerte
            </h1>
            <p className={`${jetBrainsMono.className} text-center whitespace-normal break-words text-black
            text-sm sm:text-base lg:text-lg
            px-4 sm:px-6 lg:px-0`}>
                Cuéntanos qué te interesa y con eso planeamos los talleres y pláticas del semestre.
            </p>
        </div>
    )

    if (enviado || yaRespondio) {
        return (
            <section id="conocerte" className="w-full px-4 sm:px-6 lg:px-8 mt-20 py-16">
                <div className="max-w-2xl mx-auto">
                    {encabezado}
                    <Card className="shadow-lg">
                        <CardContent className="pt-6 text-center py-10">
                            <CheckCircle className="w-16 h-16 text-[#0371a4] mx-auto mb-4" />
                            <h3 className={`${montserrat.className} text-xl font-semibold mb-2`}>
                                {enviado ? "¡Gracias por contarnos!" : "Ya nos contaste"}
                            </h3>
                            <p className={`${montserrat.className} text-muted-foreground`}>
                                Tus respuestas nos ayudan a decidir qué talleres y pláticas organizar.
                                Atento a nuestras redes para lo que viene.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        )
    }

    const pasoActual = PASOS[paso]
    const progreso = ((paso + 1) / PASOS.length) * 100
    const esUltimo = paso === PASOS.length - 1

    return (
        <section id="conocerte" className="w-full px-4 sm:px-6 lg:px-8 mt-20 py-16">
            <div className="max-w-2xl mx-auto">
                {encabezado}

                <Card className="shadow-lg">
                    <CardContent className="pt-6">
                        {/* Progreso */}
                        <div className="mb-8">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className={`${montserrat.className} text-sm font-medium text-[#0371a4]`}>
                                    {pasoActual.titulo}
                                </span>
                                <span className={`${montserrat.className} text-xs text-muted-foreground`}>
                                    Paso {paso + 1} de {PASOS.length}
                                </span>
                            </div>
                            <div
                                className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden"
                                role="progressbar"
                                aria-valuenow={paso + 1}
                                aria-valuemin={1}
                                aria-valuemax={PASOS.length}
                            >
                                <motion.div
                                    className="h-full rounded-full bg-[#0371a4]"
                                    initial={false}
                                    animate={{ width: `${progreso}%` }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {/*
                              La animación es decorativa: el paso se monta y se ve de
                              inmediato al cambiar la `key`. A propósito no se usa
                              `AnimatePresence mode="wait"` ni una animación de salida,
                              porque eso condiciona la aparición del contenido a que la
                              animación termine — y si no corre (pestaña en segundo plano,
                              equipo en ahorro de energía), el formulario se queda trabado.
                            */}
                                <motion.div
                                    key={paso}
                                    initial={{ x: 24 }}
                                    animate={{ x: 0 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="min-h-[260px]"
                                >
                                    <p className={`${montserrat.className} text-lg font-medium mb-6`}>
                                        {pasoActual.pregunta}
                                    </p>

                                    {paso === 0 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombreCompleto">Nombre completo *</Label>
                                                <Input
                                                    id="nombreCompleto"
                                                    placeholder="Ingresa tu nombre completo"
                                                    {...form.register("nombreCompleto")}
                                                />
                                                {form.formState.errors.nombreCompleto && (
                                                    <p className="text-sm text-destructive">
                                                        {form.formState.errors.nombreCompleto.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="grupoSemestre">Grupo / Semestre *</Label>
                                                <Input
                                                    id="grupoSemestre"
                                                    placeholder="Por ejemplo: 501 o 5.º semestre"
                                                    {...form.register("grupoSemestre")}
                                                />
                                                {form.formState.errors.grupoSemestre && (
                                                    <p className="text-sm text-destructive">
                                                        {form.formState.errors.grupoSemestre.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {paso === 1 && (
                                        <div>
                                            <p className={`${montserrat.className} text-sm text-muted-foreground mb-3`}>
                                                Puedes elegir varias.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {INTERESES.map((opcion) => (
                                                    <Opcion
                                                        key={opcion.valor}
                                                        activo={form.watch("interesesTecnologicos").includes(opcion.valor)}
                                                        onClick={() => alternar("interesesTecnologicos", opcion.valor)}
                                                    >
                                                        {opcion.etiqueta}
                                                    </Opcion>
                                                ))}
                                            </div>
                                            {form.formState.errors.interesesTecnologicos && (
                                                <p className="text-sm text-destructive mt-3">
                                                    {form.formState.errors.interesesTecnologicos.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {paso === 2 && (
                                        <div>
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {NIVELES.map((opcion) => {
                                                    const activo = form.watch("nivelExperiencia") === opcion.valor
                                                    return (
                                                        <button
                                                            key={opcion.valor}
                                                            type="button"
                                                            aria-pressed={activo}
                                                            onClick={() =>
                                                                form.setValue("nivelExperiencia", opcion.valor, {
                                                                    shouldValidate: true,
                                                                })
                                                            }
                                                            className={cn(
                                                                "rounded-lg border p-4 text-left transition-all duration-200 cursor-pointer",
                                                                activo
                                                                    ? "border-[#0371a4] bg-[#0371a4]/5 shadow-sm"
                                                                    : "border-neutral-300 hover:border-[#0371a4]",
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    `${montserrat.className} block font-semibold`,
                                                                    activo ? "text-[#0371a4]" : "text-neutral-800",
                                                                )}
                                                            >
                                                                {opcion.etiqueta}
                                                            </span>
                                                            <span className="block text-xs text-muted-foreground mt-1">
                                                                {opcion.ayuda}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {form.formState.errors.nivelExperiencia && (
                                                <p className="text-sm text-destructive mt-3">
                                                    {form.formState.errors.nivelExperiencia.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {paso === 3 && (
                                        <div>
                                            <p className={`${montserrat.className} text-sm text-muted-foreground mb-3`}>
                                                Puedes elegir varias.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {FORMATOS.map((opcion) => (
                                                    <Opcion
                                                        key={opcion.valor}
                                                        activo={form.watch("formatoEventos").includes(opcion.valor)}
                                                        onClick={() => alternar("formatoEventos", opcion.valor)}
                                                    >
                                                        {opcion.etiqueta}
                                                    </Opcion>
                                                ))}
                                            </div>
                                            {form.formState.errors.formatoEventos && (
                                                <p className="text-sm text-destructive mt-3">
                                                    {form.formState.errors.formatoEventos.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {paso === 4 && (
                                        <div>
                                            <p className={`${montserrat.className} text-sm text-muted-foreground mb-3`}>
                                                Puedes elegir varias.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {INDUSTRIAS.map((opcion) => (
                                                    <Opcion
                                                        key={opcion.valor}
                                                        activo={form.watch("industriaCuriosidad").includes(opcion.valor)}
                                                        onClick={() => alternar("industriaCuriosidad", opcion.valor)}
                                                    >
                                                        {opcion.etiqueta}
                                                    </Opcion>
                                                ))}
                                            </div>
                                            {form.formState.errors.industriaCuriosidad && (
                                                <p className="text-sm text-destructive mt-3">
                                                    {form.formState.errors.industriaCuriosidad.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {paso === 5 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="metaSemestre" className="sr-only">
                                                ¿Qué te mueres por aprender este semestre?
                                            </Label>
                                            <Textarea
                                                id="metaSemestre"
                                                placeholder="Escríbelo con tus palabras, no hay respuesta incorrecta."
                                                className="min-h-[140px]"
                                                {...form.register("metaSemestre")}
                                            />
                                            {form.formState.errors.metaSemestre && (
                                                <p className="text-sm text-destructive">
                                                    {form.formState.errors.metaSemestre.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>

                            {errorEnvio && (
                                <div className="mt-6 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{errorEnvio}</span>
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={anterior}
                                    disabled={paso === 0}
                                    className="cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Atrás
                                </Button>

                                {esUltimo ? (
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                        className={`${montserrat.className} bg-[#0371a4] hover:bg-[#0371a4]/80 text-white cursor-pointer`}
                                    >
                                        {form.formState.isSubmitting ? (
                                            "Enviando..."
                                        ) : (
                                            <>
                                                Enviar respuestas
                                                <Send className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={siguiente}
                                        className={`${montserrat.className} bg-[#0371a4] hover:bg-[#0371a4]/80 text-white cursor-pointer`}
                                    >
                                        Siguiente
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
