"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle } from "lucide-react"
import { montserrat } from "@/lib/fonts"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { opcionesDeRegistro } from "@/app/data/comingSoon"

interface FormData {
    nombreCompleto: string
    email: string
    telefono: string
    grupo: string
    taller: string
}

interface FormErrors {
    nombreCompleto?: string
    email?: string
    telefono?: string
    grupo?: string
    taller?: string
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        nombreCompleto: "",
        email: "",
        telefono: "",
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
    const talleres = opcionesDeRegistro("Taller")
    const registroCerrado = talleres.length === 0

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "nombreCompleto":
                if (!value.trim()) return "El nombre completo es requerido"
                if (value.trim().length < 3) return "El nombre completo debe tener al menos 3 caracteres"
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras y espacios"
                return undefined
            
            case "email":
                if (!value.trim()) return "El email es requerido"
                const emailRegex = /^[^\s@]+@uaeh\.edu\.mx$/
                if (!emailRegex.test(value)) return "El email no es válido, por favor ingresa un email de la UAEH"
                return undefined
            
            case "telefono":
                if (!value.trim()) return "El número de teléfono es requerido"
                const telefonoRegex = /^[\d\s\-+$$$$]+$/;
                if (!telefonoRegex.test(value)) return "El número de teléfono no es válido"
                if (value.replace(/\D/g, "").length < 8) return "El número de teléfono debe tener al menos 8 dígitos"
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
                telefono: "",
                grupo: "",
                taller: "",
            })
            setErrors({})
            setTouched({})
        } catch (error) {
            console.error("Error al registrar el taller:", error)
            setErrorEnvio(
                "No pudimos registrar tu inscripción. Revisa tu conexión e inténtalo de nuevo."
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
            <CardTitle className={`${montserrat.className} text-xl text-center text-foreground`}>Formulario de Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombreCompleto" className={`${montserrat.className} text-sm font-medium`}>
                  Nombre Completo *
                </Label>
                <div className="relative">
                  <Input
                    id="nombreCompleto"
                    type="text"
                    value={formData.nombreCompleto}
                    onChange={(e) => handleInputChange("nombreCompleto", e.target.value)}
                    onBlur={() => handleBlur("nombreCompleto")}
                    className={`${
                      getFieldStatus("nombreCompleto") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("nombreCompleto") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {getFieldStatus("nombreCompleto") === "success" && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.nombreCompleto && touched.nombreCompleto && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nombreCompleto}
                  </div>
                )}
              </div>
    
              <div className="space-y-2">
                <Label htmlFor="email" className={`${montserrat.className} text-sm font-medium`}>
                  Email *
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`${
                      getFieldStatus("email") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("email") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    placeholder="aa111111@uaeh.edu.mx"
                  />
                  {getFieldStatus("email") === "success" && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>
    
              <div className="space-y-2">
                <Label htmlFor="telefono" className={`${montserrat.className} text-sm font-medium`}>
                  Teléfono *
                </Label>
                <div className="relative">
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    onBlur={() => handleBlur("telefono")}
                    className={`${
                      getFieldStatus("telefono") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("telefono") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    placeholder="+52 123 456 7890"
                  />
                  {getFieldStatus("telefono") === "success" && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.telefono && touched.telefono && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.telefono}
                  </div>
                )}
              </div>
    
              <div className="space-y-2">
                <Label htmlFor="grupo" className={`${montserrat.className} text-sm font-medium`}>
                  Grupo *
                </Label>
                <Select value={formData.grupo} onValueChange={(value) => handleInputChange("grupo", value)}>
                  <SelectTrigger
                    className={`${
                      getFieldStatus("grupo") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("grupo") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    onBlur={() => handleBlur("grupo")}
                  >
                    <SelectValue placeholder="Selecciona tu grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="101">Grupo 101</SelectItem>
                    <SelectItem value="102">Grupo 102</SelectItem>
                    <SelectItem value="301">Grupo 301</SelectItem>
                    <SelectItem value="302">Grupo 302</SelectItem>
                    <SelectItem value="501">Grupo 501</SelectItem>
                    <SelectItem value="502">Grupo 502</SelectItem>
                    <SelectItem value="701">Grupo 701</SelectItem>
                    <SelectItem value="702">Grupo 702</SelectItem>
                  </SelectContent>
                </Select>
                {errors.grupo && touched.grupo && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.grupo}
                  </div>
                )}
              </div>
    
              <div className="space-y-2">
                <Label htmlFor="taller" className={`${montserrat.className} text-sm font-medium`}>
                  Taller *
                </Label>
                <Select value={formData.taller} onValueChange={(value) => handleInputChange("taller", value)}>
                  <SelectTrigger
                    className={`${
                      getFieldStatus("taller") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("taller") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    onBlur={() => handleBlur("taller")}
                  >
                    <SelectValue placeholder="Selecciona un taller" />
                  </SelectTrigger>
                  <SelectContent>
                    {talleres.map((opcion) => (
                      <SelectItem key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.taller && touched.taller && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.taller}
                  </div>
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
                className={`${montserrat.className} w-full bg-[#0371a4] hover:bg-[#0371a4]/80 text-white cursor-pointer`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Registro"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )
    
    
    
}