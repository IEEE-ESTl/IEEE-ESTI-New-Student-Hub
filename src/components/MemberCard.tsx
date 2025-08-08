// src/components/MemberCard.tsx
'use client'
import { Card} from "./ui/card";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Terminal, Brush, HandCoins } from "lucide-react";
import ieeeIcon from '@/assets/academicons--ieee-black.svg'
import ieeeWhiteIcon from '@/assets/academicons--ieee.svg'

const IEEEIcon = ({ className }: { className?: string }) => (
  <Image 
    src={ieeeIcon} // O la ruta donde tengas tu imagen del icono IEEE
    alt="IEEE"
    width={24}
    height={24}
    className='text-white'
  />
);

const IEEEWhiteIcon = ({ className }: { className?: string }) => (
  <Image
    src={ieeeWhiteIcon}
    alt="IEEE"
    width={24}
    height={24}
    className='text-white'
  />
)

interface Badge {
    name: string
    description: string
    icon: string
    color: string
    iconColor: string
}

interface Member {
    name: string
    date: string
    image: StaticImageData | string
    badges: Badge[]
}

const iconMap = {
    terminal: Terminal,
    brush: Brush,
    handCoins: HandCoins,
    ieee: IEEEIcon,
    ieeeWhite: IEEEWhiteIcon,
}

interface BadgeProps {
    icon: keyof typeof iconMap
    color: string
    iconColor: string
}

const Badge = ({ icon, color, iconColor }: BadgeProps) => {
    const IconComponent = iconMap[icon]
    
    return (
      <div className={`rounded-md ${color} text-white p-2`}>
        <IconComponent className={`${iconColor} w-6 h-6`} />
      </div>
    )
}

const MemberCard = ({ member }: { member: Member }) => {
    const [badges] = useState<Badge[]>(member.badges)
  
    return (
      <TooltipProvider>
        <Card className="w-[300px] h-[400px] bg-black overflow-hidden relative group p-0">
          <div className="relative h-full w-full">
            <Image
              src={member.image || "/placeholder.svg"}
              alt={`${member.name} profile`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-4 z-10">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-grow gap-2 items-center">
                  <div className="flex flex-col">
                    <h3 className="text-sm text-white font-semibold">{member.name}</h3>
                    <p className="text-xs text-white/60">{member.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  {badges && badges.map((badge, index) => (
                    <Tooltip key={`${member.name}-${badge.name}-${index}`}>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <Badge
                            icon={badge.icon as "terminal" | "brush" | "handCoins" | "ieee"}
                            color={badge.color}
                            iconColor={badge.iconColor}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="p-3">
                        <div className="text-sm">
                          <div className="font-bold">{badge.name}</div>
                          <div className="text-xs text-muted-foreground">{badge.description}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </TooltipProvider>
    )
  }

  export default MemberCard;