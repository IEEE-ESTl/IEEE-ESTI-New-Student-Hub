"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { montserrat } from "@/lib/fonts"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { opcionesDeRegistro } from "@/app/data/comingSoon"

interface FormData {
    nombreCompleto: string
    email: string
    telefono: string
    grupo: string
    evento: string // slug del evento, p. ej. "hackathon-frontend"
}

interface FormErrors {
    nombreCompleto?: string
    email?: string
    telefono?: string
    grupo?: string
    evento?: string
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        nombreCompleto: "",
        email: "",
        telefono: "",
        grupo: "",
        evento: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Las opciones salen de los datos del evento, no de una lista escrita aqui.
    // Si no hay ninguna con inscripcion abierta, el registro esta cerrado: no
    // existe un interruptor aparte que se pueda quedar desincronizado.
    const opciones = opcionesDeRegistro()
    const registroCerrado = opciones.length === 0

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

    const registrar = useMutation(api.events.registrar)

    // --- VALIDACIONES ---
    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "nombreCompleto":
                if (!value.trim()) return "El nombre es requerido"
                if (value.trim().length < 3) return "Mínimo 3 caracteres"
                return undefined

            case "email":
                if (!value.trim()) return "El email es requerido"
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value)) return "Email inválido"
                return undefined

            case "telefono":
                if (!value.trim()) return "El teléfono es requerido"
                const telefonoRegex = /^[\d\s\-+()]+$/;
                if (!telefonoRegex.test(value)) return "Formato inválido"
                if (value.replace(/\D/g, "").length < 10) return "Mínimo 10 dígitos"
                return undefined

            case "evento":
                if (!value.trim()) return "Debes seleccionar un evento"
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

    // --- ENVÍO DEL FORMULARIO ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 1. Validar todo antes de enviar
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

        if (!isValid) return

        setIsSubmitting(true)
        setErrorEnvio(null)

        try {
            await registrar(formData)

            setIsSubmitted(true)
            setFormData({ nombreCompleto: "", email: "", telefono: "", grupo: "", evento: "" })
            setErrors({})
            setTouched({})
        } catch (error) {
            console.error("Error registro:", error)
            setErrorEnvio(
                "No pudimos reservar tu lugar. Revisa tu conexión e inténtalo de nuevo."
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

    // --- UI: ESTADO ENVIADO ---
    if (isSubmitted) {
        return (
            <Card className="shadow-lg border-t-4 border-[#0371a4]">
                <CardContent className="pt-6 text-center py-8">
                    <CheckCircle className="w-16 h-16 text-[#0371a4] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">¡Registro Exitoso!</h3>
                    <p className="text-muted-foreground">
                        Tu lugar ha sido reservado correctamente en la base de datos.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // --- UI: FORMULARIO ---
    return (
        registroCerrado ? (
            <Card className="shadow-lg border-t-4 border-destructive">
                <CardContent className="pt-6 text-center py-8">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Registro Cerrado</h3>
                    <p className="text-muted-foreground">
                        Por ahora no hay eventos con inscripción abierta. Atento a nuestras redes
                        para los próximos.
                    </p>
                </CardContent>
            </Card>
        ) : (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className={`${montserrat.className} text-xl text-center`}>
                        Registro de Asistencia
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Selección de Evento */}
                        <div className="space-y-2">
                            <Label htmlFor="evento" className="text-sm font-medium">Selecciona el Evento *</Label>
                            <Select value={formData.evento} onValueChange={(v) => handleInputChange("evento", v)}>
                                <SelectTrigger className={getFieldStatus("evento") === "error" ? "border-destructive" : ""}>
                                    <SelectValue placeholder="-- Elige un evento --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {opciones.map((opcion) => (
                                        <SelectItem key={opcion.valor} value={opcion.valor}>
                                            {opcion.etiqueta}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.evento && <p className="text-xs text-destructive">{errors.evento}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                                <div className="relative">
                                    <Input
                                        id="nombreCompleto"
                                        value={formData.nombreCompleto}
                                        onChange={(e) => handleInputChange("nombreCompleto", e.target.value)}
                                        onBlur={() => handleBlur("nombreCompleto")}
                                        className={getFieldStatus("nombreCompleto") === "error" ? "border-destructive" : ""}
                                    />
                                    {getFieldStatus("nombreCompleto") === "success" && (
                                        <CheckCircle className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                                    )}
                                </div>
                                {errors.nombreCompleto && touched.nombreCompleto && (
                                    <p className="text-xs text-destructive">{errors.nombreCompleto}</p>
                                )}
                            </div>

                            {/* Grupo */}
                            <div className="space-y-2">
                                <Label htmlFor="grupo">Grupo / Semestre *</Label>
                                <Select value={formData.grupo} onValueChange={(v) => handleInputChange("grupo", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="101">101</SelectItem>
                                        <SelectItem value="102">102</SelectItem>
                                        <SelectItem value="301">301</SelectItem>
                                        <SelectItem value="302">302</SelectItem>
                                        <SelectItem value="501">501</SelectItem>
                                        <SelectItem value="502">502</SelectItem>
                                        <SelectItem value="701">701</SelectItem>
                                        <SelectItem value="702">702</SelectItem>
                                        <SelectItem value="external">Externo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico *</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    onBlur={() => handleBlur("email")}
                                    className={getFieldStatus("email") === "error" ? "border-destructive" : ""}
                                    placeholder="nombre@ejemplo.com"
                                />
                                {getFieldStatus("email") === "success" && (
                                    <CheckCircle className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                                )}
                            </div>
                            {errors.email && touched.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono *</Label>
                            <Input
                                id="telefono"
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => handleInputChange("telefono", e.target.value)}
                                onBlur={() => handleBlur("telefono")}
                                className={getFieldStatus("telefono") === "error" ? "border-destructive" : ""}
                            />
                            {errors.telefono && touched.telefono && (
                                <p className="text-xs text-destructive">{errors.telefono}</p>
                            )}
                        </div>

                        {errorEnvio && (
                            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{errorEnvio}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full bg-[#0371a4] hover:bg-[#025a83] text-white ${montserrat.className}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...
                                </>
                            ) : (
                                "Confirmar Asistencia"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )
    );
}