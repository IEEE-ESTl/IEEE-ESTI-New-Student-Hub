"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useAction } from "convex/react"
import { api } from "../../convex/_generated/api"

const formSchema = z
  .object({
    nombreCompleto: z
      .string()
      .min(2, "El nombre completo debe tener al menos 2 caracteres")
      .max(100, "El nombre completo no puede exceder 100 caracteres"),
    email: z.string().email("Por favor ingresa un email válido").min(1, "El email es requerido"),
    telefono: z
      .string()
      .min(10, "El número de teléfono debe tener al menos 10 dígitos")
      .max(15, "El número de teléfono no puede exceder 15 dígitos")
      .regex(/^[+]?[\d\s-()]+$/, "Por favor ingresa un número de teléfono válido"),
    razonUnirse: z
      .string()
      .min(10, "Por favor explica en al menos 10 caracteres por qué quieres unirte")
      .max(500, "La descripción no puede exceder 500 caracteres"),
    tipoParticipacion: z.enum(["member", "staff-member"]),
    rolStaff: z
      .enum(["web-master", "tesorero", "designer", "secretary", "marketing"])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.tipoParticipacion === "staff-member" && !data.rolStaff) {
        return false
      }
      return true
    },
    {
      message: "Por favor selecciona un rol de staff",
      path: ["rolStaff"],
    },
  )

type FormData = z.infer<typeof formSchema>

interface JoinBranchDialogProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function JoinBranchDialog({
  children,
  title = "Sé parte de IEEE Student Branch - ESTl",
  description = "Este formulario tiene el objetivo de determinar tu interés en unirte a la IEEE Student Branch - ESTl. Como miembro, tendrás la oportunidad de colaborar con otros estudiantes apasionados por la carrera. Además, podrás participar en eventos, talleres y proyectos que te permitirán desarrollar tus habilidades y expandir tu red profesional.",
}: JoinBranchDialogProps) {
  const [open, setOpen] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  const enviarSolicitud = useAction(api.joinRequests.enviar)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      email: "",
      telefono: "",
      razonUnirse: "",
      tipoParticipacion: undefined,
      rolStaff: undefined,
    },
    mode: "onChange",
  })

  const watchTipoParticipacion = form.watch("tipoParticipacion")

  const onSubmit = async (data: FormData) => {
    setErrorEnvio(null)

    try {
      await enviarSolicitud({
        ...data,
        // El rol solo aplica cuando se postula como staff.
        rolStaff: data.tipoParticipacion === "staff-member" ? data.rolStaff : undefined,
      })

      setEnviada(true)
      form.reset()
    } catch (error) {
      console.error("Error al enviar la solicitud:", error)
      setErrorEnvio(
        "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.",
      )
    }
  }

  // Al cerrar el diálogo se limpia el estado, para que la próxima vez que se
  // abra vuelva a mostrar el formulario y no la confirmación anterior.
  const alCambiarApertura = (abierto: boolean) => {
    setOpen(abierto)
    if (!abierto) {
      setEnviada(false)
      setErrorEnvio(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={alCambiarApertura}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {enviada ? (
          <>
            <DialogHeader>
              <DialogTitle>¡Solicitud enviada!</DialogTitle>
              <DialogDescription>
                Recibimos tu solicitud para unirte a la rama. La mesa directiva la revisará y
                se pondrá en contacto contigo.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center py-6">
              <CheckCircle className="w-16 h-16 text-[#0371a4] mb-4" />
              <Button
                type="button"
                onClick={() => alCambiarApertura(false)}
                className="bg-[#0371a4] text-white hover:bg-[#0371a4]/80 py-4 px-6 cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nombreCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de teléfono *</FormLabel>
                  <FormControl>
                    <Input placeholder="+52 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="razonUnirse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Por qué te quieres unir a la rama? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos por qué quieres formar parte de nuestro equipo..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoParticipacion"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>¿De qué manera quieres participar en la rama? *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="member" id="member" />
                        <Label htmlFor="member">Miembro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="staff-member" id="staff-member" />
                        <Label htmlFor="staff-member">Miembro del staff</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchTipoParticipacion === "staff-member" && (
              <FormField
                control={form.control}
                name="rolStaff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol de staff *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="web-master">Web Master</SelectItem>
                        <SelectItem value="tesorero">Tesorero</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="secretary">Secretario</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {errorEnvio && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorEnvio}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => alCambiarApertura(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#0371a4] text-white hover:bg-[#0371a4]/80  py-4 px-6 cursor-pointer">
                {form.formState.isSubmitting ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </form>
        </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
