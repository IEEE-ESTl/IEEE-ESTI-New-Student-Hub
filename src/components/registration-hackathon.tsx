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
import { supabase } from "@/config/supabaseClient"
import { set } from "zod"

interface FormData {
    fullName: string
    email: string
    phone: string
    group: string
    workshop: string
}

interface FormErrors {
    fullName?: string
    email?: string
    phone?: string
    group?: string
    workshop?: string
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        group: "",
        workshop: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "fullName":
                if (!value.trim()) return "El nombre completo es requerido"
                if (value.trim().length < 3) return "El nombre completo debe tener al menos 3 caracteres"
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras y espacios"
                return undefined
            
            case "email":
                if (!value.trim()) return "El email es requerido"
                const emailRegex = /^[^\s@]+@uaeh\.edu\.mx$/
                if (!emailRegex.test(value)) return "El email no es válido, por favor ingresa un email de la UAEH"
                return undefined
            
            case "phone":
                if (!value.trim()) return "El número de teléfono es requerido"
                const phoneRegex = /^[\d\s\-+$$$$]+$/;
                if (!phoneRegex.test(value)) return "El número de teléfono no es válido"
                if (value.replace(/\D/g, "").length < 8) return "El número de teléfono debe tener al menos 8 dígitos"
                return undefined
            
            case "group":
                if (!value.trim()) return "El grupo es requerido"
                return undefined
            
            case "workshop":
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

        const userData: FormData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            group: formData.group,
            workshop: formData.workshop,
        }

        try {

            const { data: existingUser, error: checkError } = await supabase
                .from("ieee-workshops")
                .select("*")
                .eq("email", formData.email)
                .single();

            if (existingUser) {
                setIsSubmitting(false);
                setErrors({
                    email: "Este email ya ha sido registrado, por favor utiliza otro.",
                })
                setTouched((prev) => ({ ...prev, email: true }));
                return;
            }
                
            const { data, error } = await supabase
                .from("ieee-workshops")
                .insert([userData])
                .select();
            
                if (error) throw error;

                if (data) {
                    setIsSubmitting(false)
                    setIsSubmitted(true)
                }

                setTimeout(() => {
                    setIsSubmitted(false)
                    setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        group: "",
                        workshop: "",
                    })
                    setErrors({})
                    setTouched({})
                }, 5000);
        } catch (error) {
            console.error("Error al registrar el taller:", error)
            setIsSubmitting(false)
            setErrors({
                fullName: "Error al registrar el taller",
            })
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
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    className={`${
                      getFieldStatus("fullName") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("fullName") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {getFieldStatus("fullName") === "success" && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.fullName && touched.fullName && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
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
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={`${
                      getFieldStatus("phone") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("phone") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    placeholder="+52 123 456 7890"
                  />
                  {getFieldStatus("phone") === "success" && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.phone && touched.phone && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </div>
                )}
              </div>
    
              <div className="space-y-2">
                <Label htmlFor="group" className={`${montserrat.className} text-sm font-medium`}>
                  Grupo *
                </Label>
                <Select value={formData.group} onValueChange={(value) => handleInputChange("group", value)}>
                  <SelectTrigger
                    className={`${
                      getFieldStatus("group") === "error"
                        ? "border-destructive focus:ring-destructive"
                        : getFieldStatus("group") === "success"
                          ? "border-accent focus:ring-accent"
                          : ""
                    }`}
                    onBlur={() => handleBlur("group")}
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
                {errors.group && touched.group && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.group}
                  </div>
                )}
              </div>
    
    
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