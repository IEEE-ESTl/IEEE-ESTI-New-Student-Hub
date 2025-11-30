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
import { supabase } from "@/config/supabaseClient"

// Esquema que coincide con tu lógica de negocio
// Aunque la tabla pide UUIDs, el form debe recolectar la info para crear ese UUID
interface FormData {
    fullName: string
    email: string
    phone: string
    group: string
    eventId: string // UUID del evento
}

interface FormErrors {
    fullName?: string
    email?: string
    phone?: string
    group?: string
    eventId?: string
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        group: "",
        eventId: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [isRegistrationClosed, setIsRegistrationClosed] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // --- VALIDACIONES ---
    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "fullName":
                if (!value.trim()) return "El nombre es requerido"
                if (value.trim().length < 3) return "Mínimo 3 caracteres"
                return undefined

            case "email":
                if (!value.trim()) return "El email es requerido"
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value)) return "Email inválido"
                return undefined

            case "phone":
                if (!value.trim()) return "El teléfono es requerido"
                const phoneRegex = /^[\d\s\-+()]+$/;
                if (!phoneRegex.test(value)) return "Formato inválido"
                if (value.replace(/\D/g, "").length < 10) return "Mínimo 10 dígitos"
                return undefined

            case "eventId":
                if (!value.trim()) return "Debes seleccionar un evento"
                // Opcional: Validar que sea UUID v4
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

        try {
            // 2. Llamada a Supabase
            // Usamos .rpc() (Remote Procedure Call)
            // Esto permite enviar datos de perfil + ID de evento, y que la base de datos
            // se encargue de buscar/crear el usuario y llenar 'event_registration'.

            // Dentro de handleSubmit...

            const { data, error } = await supabase.rpc('register_attendee', {
                p_full_name: formData.fullName,  // Coincide con el argumento SQL
                p_email: formData.email,
                p_phone: formData.phone,         // Ahora se guardará en la tabla user
                p_group: formData.group,         // Ahora se guardará en la tabla user
                p_event_id: formData.eventId
            })

            if (error) throw error

            // Éxito
            setIsSubmitted(true)

            // Reset automático
            setFormData({ fullName: "", email: "", phone: "", group: "", eventId: "" })
            setErrors({})
            setTouched({})


        } catch (error: any) {
            console.error("Error registro:", error)
            let errorMsg = "Error al procesar el registro."

            // Manejo de errores comunes de SQL (ej: unique constraint)
            if (error.message?.includes("violates unique constraint")) {
                errorMsg = "Este correo ya está registrado para este evento."
            }

            setErrors({ email: errorMsg })
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
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
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
        isRegistrationClosed ? (
            <Card className="shadow-lg border-t-4 border-destructive">
                <CardContent className="pt-6 text-center py-8">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Registro Cerrado</h3>
                    <p className="text-muted-foreground">
                        Lo sentimos, el período de registro para este evento ha finalizado.
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
                            <Label htmlFor="eventId" className="text-sm font-medium">Selecciona el Evento *</Label>
                            <Select value={formData.eventId} onValueChange={(v) => handleInputChange("eventId", v)}>
                                <SelectTrigger className={getFieldStatus("eventId") === "error" ? "border-destructive" : ""}>
                                    <SelectValue placeholder="-- Elige un evento --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="008608d9-a8c1-46e3-b3c5-d53d527c9e65">Hackathon Frontend</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.eventId && <p className="text-xs text-destructive">{errors.eventId}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nombre Completo *</Label>
                                <div className="relative">
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                        onBlur={() => handleBlur("fullName")}
                                        className={getFieldStatus("fullName") === "error" ? "border-destructive" : ""}
                                    />
                                    {getFieldStatus("fullName") === "success" && (
                                        <CheckCircle className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                                    )}
                                </div>
                                {errors.fullName && touched.fullName && (
                                    <p className="text-xs text-destructive">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Grupo */}
                            <div className="space-y-2">
                                <Label htmlFor="group">Grupo / Semestre *</Label>
                                <Select value={formData.group} onValueChange={(v) => handleInputChange("group", v)}>
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
                            <Label htmlFor="phone">Teléfono *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                onBlur={() => handleBlur("phone")}
                                className={getFieldStatus("phone") === "error" ? "border-destructive" : ""}
                            />
                            {errors.phone && touched.phone && (
                                <p className="text-xs text-destructive">{errors.phone}</p>
                            )}
                        </div>

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