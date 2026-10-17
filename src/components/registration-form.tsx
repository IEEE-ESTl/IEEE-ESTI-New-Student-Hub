"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { montserrat } from "@/lib/fonts"
import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "../../convex/_generated/api"
import { opcionesDeRegistro } from "@/app/data/comingSoon"

interface FormData {
    nombreCompleto: string
    email: string
    numeroCuenta: string
    grupo: string
    taller: string
}

interface FormErrors {
    nombreCompleto?: string
    email?: string
    numeroCuenta?: string
    grupo?: string
    taller?: string
}

const GRUPOS = ["101", "102", "301", "302", "501", "502", "701", "702"]

/**
 * Un campo del formulario, con su numero y su pista.
 *
 * Existe para que los cinco campos se vean iguales sin repetir el mismo bloque
 * cinco veces: antes cada uno traia su propia copia del label, el borde de
 * error y el mensaje, y bastaba con tocar uno para que dejara de parecerse a
 * los demas.
 */
function Campo({
    numero,
    etiqueta,
    pista,
    htmlFor,
    error,
    children,
}: {
    numero: number
    etiqueta: string
    pista: string
    htmlFor: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
                <Label
                    htmlFor={htmlFor}
                    className={`${montserrat.className} text-sm font-semibold text-foreground`}
                >
                    <span className="mr-1.5 text-[#0371a4]">{numero}.</span>
                    {etiqueta}
                </Label>
                <span
                    className={`${montserrat.className} shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground`}
                >
                    {pista}
                </span>
            </div>

            {children}

            {error && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    )
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        nombreCompleto: "",
        email: "",
        numeroCuenta: "",
        grupo: "",
        taller: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

    const registrar = useMutation(api.workshops.registrar)

    // Los talleres disponibles salen de los datos del evento, filtrando por
    // categoria. Sin talleres con inscripcion abierta, el registro esta cerrado.
    // `llenos` llega de Convex y es reactivo: si alguien toma el ultimo lugar
    // mientras esta pantalla esta abierta, la opcion se marca sola como agotada.
    const llenos = useQuery(api.cupos.llenos)
    const talleres = opcionesDeRegistro("Taller").map((opcion) => ({
        ...opcion,
        agotado: llenos?.includes(opcion.valor) ?? false,
    }))
    const registroCerrado = talleres.length === 0

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "nombreCompleto":
                if (!value.trim()) return "El nombre completo es requerido"
                if (value.trim().length < 3) return "El nombre completo debe tener al menos 3 caracteres"
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras y espacios"
                return undefined

            case "email":
                if (!value.trim()) return "El correo es requerido"
                if (!/^[^\s@]+@uaeh\.edu\.mx$/.test(value)) return "Usa tu correo institucional (@uaeh.edu.mx)"
                return undefined

            // Solo se valida la longitud, no el prefijo: los primeros digitos
            // indican la generacion, asi que exigir "49" dejaria fuera a quien
            // venga de una generacion anterior. Misma regla que en el servidor.
            case "numeroCuenta":
                if (!value.trim()) return "El número de cuenta es requerido"
                if (!/^\d+$/.test(value)) return "Solo números, sin espacios ni letras"
                if (value.length !== 6) return "El número de cuenta son 6 dígitos"
                return undefined

            case "grupo":
                if (!value.trim()) return "El grupo es requerido"
                return undefined

            case "taller":
                if (!value.trim()) return "El taller es requerido"
                return undefined

            default:
                return undefined
        }
    }

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))

        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error }))
    }

    const handleBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        let isValid = true

        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key as keyof FormData])
            if (error) {
                newErrors[key as keyof FormErrors] = error
                isValid = false
            }
        })

        setErrors(newErrors)
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setErrorEnvio(null)

        try {
            await registrar(formData)

            setIsSubmitted(true)
            setFormData({
                nombreCompleto: "",
                email: "",
                numeroCuenta: "",
                grupo: "",
                taller: "",
            })
            setErrors({})
            setTouched({})
        } catch (error) {
            console.error("Error al registrar el taller:", error)

            // El servidor manda los motivos que el alumno puede resolver —ya
            // estas inscrito en otro taller, el cupo se lleno— dentro de un
            // ConvexError. Mostrar siempre el texto generico escondia justo lo
            // que hacia falta leer.
            const motivo = error instanceof ConvexError ? String(error.data) : null
            setErrorEnvio(
                motivo ??
                    "No pudimos registrar tu inscripción. Revisa tu conexión e inténtalo de nuevo.",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const getFieldStatus = (fieldName: string) => {
        const hasError = errors[fieldName as keyof FormErrors]
        const isTouched = touched[fieldName]
        const hasValue = formData[fieldName as keyof FormData]

        if (hasError && isTouched) return "error"
        if (!hasError && isTouched && hasValue) return "success"
        return "default"
    }

    /** Borde rojo o verde segun como vaya el campo. */
    const borde = (campo: string) =>
        getFieldStatus(campo) === "error"
            ? "border-destructive focus:ring-destructive"
            : getFieldStatus(campo) === "success"
              ? "border-accent focus:ring-accent"
              : ""

    const errorDe = (campo: keyof FormErrors) =>
        touched[campo] ? errors[campo] : undefined

    if (isSubmitted) {
        return (
            <Card className="shadow-lg">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-[#0371a4] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">¡Registro Exitoso!</h3>
                        <p className="text-muted-foreground">
                            Tu inscripción ha sido procesada correctamente. Te contactaremos pronto.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (registroCerrado) {
        return (
            <Card className="shadow-lg border-t-4 border-destructive">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">Registro Cerrado</h3>
                        <p className="text-muted-foreground">
                            Por ahora no hay talleres con inscripción abierta. Atento a nuestras redes
                            para los próximos.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className={`${montserrat.className} text-xl text-center text-foreground`}>
                    Formulario de Registro
                </CardTitle>
                <p className={`${montserrat.className} text-center text-sm text-muted-foreground`}>
                    Solo puedes inscribirte a un taller.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Campo
                        numero={1}
                        etiqueta="Número de cuenta"
                        pista="6 dígitos"
                        htmlFor="numeroCuenta"
                        error={errorDe("numeroCuenta")}
                    >
                        <Input
                            id="numeroCuenta"
                            // `inputMode` saca el teclado numerico en el celular,
                            // que es desde donde se van a inscribir casi todos.
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={6}
                            value={formData.numeroCuenta}
                            // Se descartan los caracteres que no son digitos en vez de
                            // avisar despues: el campo solo admite numeros, asi que
                            // vale mas impedir el error que señalarlo.
                            onChange={(e) =>
                                handleInputChange("numeroCuenta", e.target.value.replace(/\D/g, ""))
                            }
                            onBlur={() => handleBlur("numeroCuenta")}
                            className={`${borde("numeroCuenta")} tracking-widest`}
                            placeholder="49XXXX"
                        />
                    </Campo>

                    <Campo
                        numero={2}
                        etiqueta="Correo electrónico"
                        pista="institucional"
                        htmlFor="email"
                        error={errorDe("email")}
                    >
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            className={borde("email")}
                            placeholder="alumno@uaeh.edu.mx"
                        />
                    </Campo>

                    <Campo
                        numero={3}
                        etiqueta="Nombre completo"
                        pista="nombre y apellidos"
                        htmlFor="nombreCompleto"
                        error={errorDe("nombreCompleto")}
                    >
                        <Input
                            id="nombreCompleto"
                            type="text"
                            autoComplete="name"
                            value={formData.nombreCompleto}
                            onChange={(e) => handleInputChange("nombreCompleto", e.target.value)}
                            onBlur={() => handleBlur("nombreCompleto")}
                            className={borde("nombreCompleto")}
                            placeholder="Tu nombre y apellidos"
                        />
                    </Campo>

                    <Campo
                        numero={4}
                        etiqueta="Grupo"
                        pista="seleccionar grupo"
                        htmlFor="grupo"
                        error={errorDe("grupo")}
                    >
                        <Select
                            value={formData.grupo}
                            onValueChange={(value) => handleInputChange("grupo", value)}
                        >
                            <SelectTrigger
                                id="grupo"
                                className={`w-full ${borde("grupo")}`}
                                onBlur={() => handleBlur("grupo")}
                            >
                                <SelectValue placeholder="Selecciona tu grupo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {GRUPOS.map((grupo) => (
                                    <SelectItem key={grupo} value={grupo}>
                                        Grupo {grupo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Campo>

                    <Campo
                        numero={5}
                        etiqueta="Taller"
                        pista="seleccionar taller"
                        htmlFor="taller"
                        error={errorDe("taller")}
                    >
                        <Select
                            value={formData.taller}
                            onValueChange={(value) => handleInputChange("taller", value)}
                        >
                            <SelectTrigger
                                id="taller"
                                className={`w-full ${borde("taller")}`}
                                onBlur={() => handleBlur("taller")}
                            >
                                <SelectValue placeholder="Selecciona un taller..." />
                            </SelectTrigger>
                            <SelectContent>
                                {talleres.map((opcion) => (
                                    <SelectItem
                                        key={opcion.valor}
                                        value={opcion.valor}
                                        disabled={opcion.agotado}
                                    >
                                        {opcion.etiqueta}
                                        {opcion.agotado && " — Cupo lleno"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Campo>

                    {errorEnvio && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{errorEnvio}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className={`${montserrat.className} w-full bg-[#0371a4] hover:bg-[#0371a4]/80 text-white cursor-pointer`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Enviando..." : "Enviar Registro"}
                    </Button>

                    <p className="border-t pt-4 text-center text-sm">
                        <Link
                            href="/estatus"
                            className="inline-flex items-center gap-1 text-[#0371a4] underline underline-offset-4 transition-all duration-200 hover:gap-2"
                        >
                            ¿Ya te inscribiste? Consulta tu estatus
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}
