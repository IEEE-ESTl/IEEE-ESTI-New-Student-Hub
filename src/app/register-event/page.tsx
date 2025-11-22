import { RegistrationForm } from "@/components/registration-event-form"
import { montserrat, bebasNeue } from "@/lib/fonts"

export default function RegisterWorkshopPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-20">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className={`${bebasNeue.className} font-bold text-[#0371a4] text-center text-5xl lg:text-5xl xl:text-6xl`}>Registro de Eventos</h1>
                    <p className={`${montserrat.className} text-muted-foreground`}>Completa el formulario para inscribirte en los eventos proximos</p>
                </div>
                <RegistrationForm />
            </div>
        </main>
    )
}