import { RegistrationForm } from "@/components/registration-form"
import { montserrat, bebasNeue } from "@/lib/fonts"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"


export default function RegisterWorkshopPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-20">
            <div className="max-w-md mx-auto">
                <div className="mb-6">
                    <Link
                        href="/coming-soon"
                        className={`${montserrat.className} inline-flex items-center gap-1 text-sm text-[#0371a4] transition-all duration-200 hover:gap-2`}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a próximamente
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className={`${bebasNeue.className} font-bold text-[#0371a4] text-center text-5xl lg:text-5xl xl:text-6xl`}>Registro de Talleres</h1>
                    <p className={`${montserrat.className} text-muted-foreground`}>Completa el formulario para inscribirte en el taller de tu preferencia</p>
                </div>
                <RegistrationForm />
            </div>
        </main>
    )
}