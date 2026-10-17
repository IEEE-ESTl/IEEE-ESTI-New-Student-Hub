import ConsultaEstatus from "@/components/ConsultaEstatus"
import { montserrat, bebasNeue } from "@/lib/fonts"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
    title: "Consulta tu estatus | IEEE ESTl",
    description: "Consulta en qué taller o evento quedaste inscrito.",
}

export default function EstatusPage() {
    return (
        <main className="mt-20 flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1
                        className={`${bebasNeue.className} text-center text-5xl font-bold text-[#0371a4] lg:text-5xl xl:text-6xl`}
                    >
                        Consulta tu estatus
                    </h1>
                    <p className={`${montserrat.className} text-muted-foreground`}>
                        Revisa en qué taller quedaste inscrito
                    </p>
                </div>

                <ConsultaEstatus />
            </div>
        </main>
    )
}
