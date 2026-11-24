"use client"

import Image, { type StaticImageData } from "next/image"
import { BriefcaseBusiness, Brush, HandCoins, MessageSquareHeart, Terminal } from "lucide-react"
import ProfileCard from "./reactbits/ProfileCard"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { montserrat } from "@/lib/fonts"
import { FONDO_COMITE } from "./fondosMiembros"
import ieeeIcon from "@/assets/academicons--ieee-black.svg"
import ieeeWhiteIcon from "@/assets/academicons--ieee.svg"

export type Rol = {
    name: string
    description: string
    icon: string
    color: string
    iconColor: string
}

export type Miembro = {
    name: string
    date: string
    image: StaticImageData | string
    badges: Rol[]
}

const IconoIEEE = ({ blanco = false }: { blanco?: boolean }) => (
    <Image src={blanco ? ieeeWhiteIcon : ieeeIcon} alt="" width={16} height={16} />
)

const ICONOS: Record<string, (props: { className?: string }) => React.ReactNode> = {
    terminal: Terminal,
    brush: Brush,
    handCoins: HandCoins,
    marketing: MessageSquareHeart,
    secretary: BriefcaseBusiness,
    ieee: () => <IconoIEEE />,
    ieeeWhite: () => <IconoIEEE blanco />,
}

/**
 * Tarjeta de un miembro del comite o de los Iconos.
 *
 * Usa ProfileCard de React Bits: la foto con su nombre y puesto, que se inclina
 * hacia el cursor y deja ver un brillo holografico. El brillo se ve a traves
 * del patron de logos de IEEE (`/patrones/ieee.svg`), asi la tarjeta es de la
 * rama y no una generica.
 *
 * ProfileCard admite un solo puesto, y varios miembros tienen mas de un rol:
 * se unen con "·" en el puesto, y en el pie se conservan los iconos de cada rol
 * con su descripcion, como estaban en la tarjeta anterior.
 */
export default function TarjetaMiembro({
    miembro,
    fondo = FONDO_COMITE,
}: {
    miembro: Miembro
    /**
     * Color detras de la foto. Las fotos estan recortadas, sin fondo, asi que
     * este color va detras de todas y la seccion se ve pareja aunque cada foto
     * se haya tomado en un lugar distinto.
     *
     * Ver `fondosMiembros.ts`.
     */
    fondo?: string
}) {
    const foto = typeof miembro.image === "string" ? miembro.image : miembro.image.src
    const puesto = miembro.badges.map((rol) => rol.name).join(" · ")

    return (
        <ProfileCard
            className={montserrat.className}
            theme="light"
            avatarUrl={foto}
            avatarAlt={`Foto de ${miembro.name}`}
            iconUrl="/patrones/ieee.svg"
            backdropColor={fondo}
            name={miembro.name}
            title={puesto}
            // En celular no hay cursor: la inclinacion con el giro del telefono
            // pide permiso al visitante, y no vale la pena por un efecto.
            enableMobileTilt={false}
            footer={
                <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-xs text-zinc-500">{miembro.date}</span>
                    <TooltipProvider>
                        <div className="flex shrink-0 items-center gap-1.5">
                            {miembro.badges.map((rol) => {
                                const Icono = ICONOS[rol.icon] ?? Terminal
                                return (
                                    <Tooltip key={rol.name}>
                                        <TooltipTrigger asChild>
                                            {/* Boton para que el rol tambien se pueda
                                                consultar con el teclado, no solo con el cursor. */}
                                            <button
                                                type="button"
                                                aria-label={rol.name}
                                                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 shadow-sm ${rol.color}`}
                                            >
                                                <Icono className={`h-4 w-4 ${rol.iconColor}`} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="p-3">
                                            <div className="text-sm">
                                                <div className="font-bold">{rol.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {rol.description}
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </TooltipProvider>
                </div>
            }
        />
    )
}
