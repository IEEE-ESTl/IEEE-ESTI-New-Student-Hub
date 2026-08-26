"use client"

import { AuthLoading, Authenticated, Unauthenticated, useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import { api } from "../../../convex/_generated/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { bebasNeue, montserrat } from "@/lib/fonts"
import TablaDatos, { type Columna } from "./TablaDatos"

const ROLES: Record<string, string> = {
    "web-master": "Web Master",
    tesorero: "Tesorero",
    designer: "Diseñador",
    secretary: "Secretario",
    marketing: "Marketing",
}

/** Convierte un slug guardado en algo legible: "desarrollo-web" -> "Desarrollo web". */
function legible(valor: string): string {
    const texto = valor.replace(/-/g, " ")
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function fecha(ms: number): string {
    return new Date(ms).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/**
 * Tablas del panel.
 *
 * Va separado del contenedor a proposito: sus `useQuery` solo deben existir
 * mientras haya sesion. Al cerrar sesion, `<Authenticated>` desmonta este
 * componente, las queries dejan de ejecutarse y no alcanzan a fallar.
 *
 * Antes estaba todo junto, y al cerrar sesion las queries se relanzaban sin
 * credenciales: `exigirSesion` lanzaba "No autorizado" —correctamente— y la
 * pagina se caia con un error de React.
 */
function PanelDatos() {
    const solicitudes = useQuery(api.admin.solicitudesUnion)
    const talleres = useQuery(api.admin.registrosTaller)
    const eventos = useQuery(api.admin.registrosEvento)
    const intereses = useQuery(api.admin.interesesEstudiantes)

    const conteo = (datos: unknown[] | undefined) => (datos === undefined ? "" : ` (${datos.length})`)

    const columnasSolicitudes: Columna<NonNullable<typeof solicitudes>[number]>[] = [
        { titulo: "Fecha", valor: (f) => fecha(f._creationTime) },
        { titulo: "Nombre", valor: (f) => f.nombreCompleto },
        { titulo: "Correo", valor: (f) => f.email },
        { titulo: "Teléfono", valor: (f) => f.telefono },
        {
            titulo: "Participación",
            valor: (f) => (f.tipoParticipacion === "member" ? "Miembro" : "Staff"),
        },
        { titulo: "Rol", valor: (f) => (f.rolStaff ? ROLES[f.rolStaff] ?? f.rolStaff : "") },
        { titulo: "Razón", valor: (f) => f.razonUnirse },
    ]

    const columnasTalleres: Columna<NonNullable<typeof talleres>[number]>[] = [
        { titulo: "Fecha", valor: (f) => fecha(f._creationTime) },
        { titulo: "Nombre", valor: (f) => f.nombreCompleto },
        { titulo: "Correo", valor: (f) => f.email },
        { titulo: "Teléfono", valor: (f) => f.telefono },
        { titulo: "Grupo", valor: (f) => f.grupo },
        { titulo: "Taller", valor: (f) => legible(f.taller) },
    ]

    const columnasEventos: Columna<NonNullable<typeof eventos>[number]>[] = [
        { titulo: "Fecha", valor: (f) => fecha(f._creationTime) },
        { titulo: "Nombre", valor: (f) => f.nombreCompleto },
        { titulo: "Correo", valor: (f) => f.email },
        { titulo: "Teléfono", valor: (f) => f.telefono },
        { titulo: "Grupo", valor: (f) => (f.grupo === "external" ? "Externo" : f.grupo) },
        { titulo: "Evento", valor: (f) => legible(f.evento) },
    ]

    const columnasIntereses: Columna<NonNullable<typeof intereses>[number]>[] = [
        { titulo: "Fecha", valor: (f) => fecha(f._creationTime) },
        { titulo: "Nombre", valor: (f) => f.nombreCompleto },
        { titulo: "Grupo / Semestre", valor: (f) => f.grupoSemestre },
        { titulo: "Nivel", valor: (f) => legible(f.nivelExperiencia) },
        {
            titulo: "Intereses",
            valor: (f) => f.interesesTecnologicos.map(legible).join(", "),
        },
        { titulo: "Formatos", valor: (f) => f.formatoEventos.map(legible).join(", ") },
        { titulo: "Industrias", valor: (f) => f.industriaCuriosidad.map(legible).join(", ") },
        { titulo: "Meta del semestre", valor: (f) => f.metaSemestre },
    ]

    return (
        <Tabs defaultValue="intereses">
                <TabsList className={`${montserrat.className} mb-6 flex h-auto flex-wrap`}>
                    <TabsTrigger value="intereses" className="cursor-pointer">
                        Queremos Conocerte{conteo(intereses)}
                    </TabsTrigger>
                    <TabsTrigger value="solicitudes" className="cursor-pointer">
                        Únete a la rama{conteo(solicitudes)}
                    </TabsTrigger>
                    <TabsTrigger value="talleres" className="cursor-pointer">
                        Talleres{conteo(talleres)}
                    </TabsTrigger>
                    <TabsTrigger value="eventos" className="cursor-pointer">
                        Eventos{conteo(eventos)}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="intereses">
                    <TablaDatos
                        filas={intereses}
                        columnas={columnasIntereses}
                        nombreArchivo="queremos-conocerte"
                        vacio="Todavía nadie ha respondido la encuesta."
                    />
                </TabsContent>

                <TabsContent value="solicitudes">
                    <TablaDatos
                        filas={solicitudes}
                        columnas={columnasSolicitudes}
                        nombreArchivo="solicitudes-union"
                        vacio="Todavía no hay solicitudes para unirse."
                    />
                </TabsContent>

                <TabsContent value="talleres">
                    <TablaDatos
                        filas={talleres}
                        columnas={columnasTalleres}
                        nombreArchivo="registros-talleres"
                        vacio="Todavía no hay registros a talleres."
                    />
                </TabsContent>

                <TabsContent value="eventos">
                    <TablaDatos
                        filas={eventos}
                        columnas={columnasEventos}
                        nombreArchivo="registros-eventos"
                        vacio="Todavía no hay registros a eventos."
                    />
                </TabsContent>
        </Tabs>
    )
}

/**
 * Contenedor del panel. El encabezado y el boton de salir viven aqui porque
 * deben seguir en pantalla mientras la sesion se cierra.
 */
export default function Panel() {
    const { signOut } = useAuthActions()
    const router = useRouter()

    const cerrarSesion = async () => {
        await signOut()
        router.push("/")
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1
                        className={`${bebasNeue.className} text-5xl font-bold text-[#0371a4] lg:text-6xl`}
                    >
                        Panel interno
                    </h1>
                    <p className={`${montserrat.className} text-muted-foreground`}>
                        Respuestas recopiladas de los formularios del sitio.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={cerrarSesion}
                    className={`${montserrat.className} cursor-pointer`}
                >
                    <LogOut className="mr-1 h-4 w-4" />
                    Cerrar sesión
                </Button>
            </div>

            <AuthLoading>
                <p className={`${montserrat.className} py-12 text-center text-muted-foreground`}>
                    Verificando sesión…
                </p>
            </AuthLoading>

            <Authenticated>
                <PanelDatos />
            </Authenticated>

            <Unauthenticated>
                <p className={`${montserrat.className} py-12 text-center text-muted-foreground`}>
                    Sesión cerrada. Redirigiendo…
                </p>
            </Unauthenticated>
        </div>
    )
}
