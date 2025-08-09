"use client";

import React, { useState } from "react";
import { BorderBeam } from "./magicui/border-beam";
import { BlurFade } from "./magicui/blur-fade";
import { bebasNeue, jetBrainsMono, montserrat } from "@/lib/fonts";
import JoinDialog from "./JoinDialog";
import { Button } from "./ui/button";

interface CardData {
    title: string[];
    description: string;
    hoverClass: string;
}

const cards: CardData[] = [
    {
      title: ['DESAFIA', 'TUS', 'HABILIDADES'],
      description: "Participa en eventos de programación como el CINSOFT y pon a prueba tus conocimientos.",
      hoverClass: 'hover:rotate-6'
    },
    {
      title: ['APRENDE', 'DE LOS', 'MEJORES'],
      description: "Asiste a talleres, conferencias, cursos y competencias para añadir valor curricular.",
      hoverClass: 'hover:translate-y-6'
    },
    {
      title: ['CONOCE', 'A TU', 'COMUNIDAD'],
      description: "Convive con otros estudiantes y profesionales dispuestos a compartir sus conocimientos.",
      hoverClass: 'hover:-rotate-6'
    }
];

const Card: React.FC<CardData> = ({ title, description, hoverClass }) => {
    const [isHovered, setIsHovered] = useState(false);
  
  
  
    return (
      <div 
        className={`relative cursor-pointer flex h-[200px] w-[300px] lg:h-[250px] lg:w-[350px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl transition-all duration-300 hover:scale-95 ${hoverClass}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'} absolute inset-0 flex flex-col items-center justify-center`}>
          {title.map((line, index) => (
            <p key={index} className={`${montserrat.className} text-3xl lg:text-4xl font-black ${index % 2 === 0 ? 'text-[#0371a4]' : ''}`}>
              {line}
            </p>
          ))}
        </div>
        <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} absolute inset-0 flex items-center justify-center p-4`}>
          <p className={`${montserrat.className} text-sm lg:text-lg text-center text-[#0371a4] p-3 font-semibold`}>{description}</p>
        </div>
        <BorderBeam
          size={200}
          duration={10}
          delay={9}
          borderWidth={6}
          colorFrom="#0371a4"
          colorTo="#95ddff"
        />
      </div>
    );
  };

  const CardGrid: React.FC = () => (
    <div className="flex flex-col lg:flex-row items-center justify-center select-none gap-10 mt-10 mb-16">
      {cards.map((card, index) => (
        <BlurFade key={index} delay={0.25 + index * 0.05} inView>
          <Card key={index} {...card} />
        </BlurFade>
      ))}
    </div>
);

export const Unete: React.FC = () => {
    return (
        <section className="flex flex-col items-center justify-center mt-5 " id="join">
            <div className="w-full max-w-6xl mx-auto px-4">
                <h1 className={`${bebasNeue.className} font-bold text-[#0371a4] text-center text-7xl lg:text-8xl xl:text-9xl`}>
                    ÚNETE
                </h1>
                
                <div className="max-w-4xl mx-auto mt-6 lg:mt-8">
                    <p className={`${jetBrainsMono.className} text-center whitespace-normal break-words text-black
                                   text-sm sm:text-base lg:text-lg
                                   px-4 sm:px-6 lg:px-0`}>
                        Al unirte a la Rama, te embarcarás en un viaje emocionante lleno de oportunidades y beneficios que enriquecerán tu experiencia académica y profesional. Aquí están algunos de los increíbles beneficios que ofrecemos a nuestros miembros:
                    </p>
                </div>
                
                <CardGrid />
                
                <div className="flex justify-center mt-8 lg:mt-0">
                    <JoinDialog>
                        <Button className={`bg-[#0371a4] text-white hover:bg-[#0371a4]/80 rounded-full cursor-pointer transition-all duration-200 ${jetBrainsMono.className}
                                           py-4 px-6 text-base
                                           sm:py-5 sm:px-7 sm:text-lg
                                           lg:py-6 lg:px-8 lg:text-xl`}>
                            Unirse
                        </Button>
                    </JoinDialog>
                </div>
            </div>
        </section>
    )
}

