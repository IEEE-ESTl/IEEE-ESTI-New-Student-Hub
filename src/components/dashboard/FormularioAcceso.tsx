"use client"

import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Lock } from "lucide-react"
import { montserrat } from "@/lib/fonts"
import { ConvexError } from "convex/values"

/**
 * Pantalla de acceso al panel interno.
 *
 * Por defecto solo ofrece iniciar sesion. Con ?alta=1 muestra el formulario de
 * registro, que se usa UNA vez para crear la cuenta del equipo.
 *
 * Ese parametro NO es lo que protege el panel, y no pretende serlo: cualquiera
 * puede escribirlo en la URL. Quien decide si se acepta un alta es el servidor,
 * en `convex/auth.ts`, segun la variable PERMITIR_ALTA_ADMIN. Con el alta
 * cerrada, este formulario simplemente falla.
 */
export default function FormularioAcceso() {
    const { signIn } = useAuthActions()
    const router = useRouter()
    const esAlta = useSearchParams().get("alta") === "1"

    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const alEnviar = async (evento: React.FormEvent<HTMLFormElement>) => {
        evento.preventDefault()
        setError(null)
        setEnviando(true)

        const datos = new FormData(evento.currentTarget)

        try {
            await signIn("password", {
                email: String(datos.get("email") ?? "").trim(),
                password: String(datos.get("password") ?? ""),
                flow: esAlta ? "signUp" : "signIn",
            })
            router.push("/dashboard")
        } catch (fallo) {
            console.error("Error de autenticacion:", fallo)

            if (esAlta) {
                // En el alta si conviene decir que paso: la usa el equipo, no un
                // desconocido, y el motivo real ahorra mucho tiempo.
                const motivo = fallo instanceof ConvexError ? String(fallo.data) : null
                setError(motivo ?? "No se pudo crear la cuenta. Revisa la consola para el detalle.")
            } else {
                // Al iniciar sesion es al reves: no se distingue entre "correo
                // inexistente" y "contrasena incorrecta", porque decirlo revelaria
                // que cuentas existen.
                setError("Correo o contraseña incorrectos.")
            }
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Card className="w-full max-w-sm shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#0371a4]/10">
                    <Lock className="h-6 w-6 text-[#0371a4]" />
                </div>
                <CardTitle className={`${montserrat.className} text-xl`}>
                    {esAlta ? "Crear cuenta del equipo" : "Panel interno"}
                </CardTitle>
                <p className={`${montserrat.className} text-sm text-muted-foreground`}>
                    {esAlta
                        ? "Solo se hace una vez, con el alta habilitada en el servidor."
                        : "Acceso exclusivo para la mesa directiva."}
                </p>
            </CardHeader>

            <CardContent>
                <form onSubmit={alEnviar} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            required
                            placeholder="admin@ieee-estl.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={esAlta ? "new-password" : "current-password"}
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={enviando}
                        className={`${montserrat.className} w-full cursor-pointer bg-[#0371a4] text-white hover:bg-[#0371a4]/80`}
                    >
                        {enviando ? "Enviando..." : esAlta ? "Crear cuenta" : "Entrar"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
