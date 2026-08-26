import { Inicio } from "@/components/Inicio";
import { Unete } from "@/components/Unete";
import { FAQ } from "@/components/FAQ";
import ComingSoon from "@/components/ComingSoon";
import QueremosConocerte from "@/components/QueremosConocerte";
import { hayProximosEventos } from "@/app/data/comingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IEEE ESTl",
  description: "IEEE ESTl",
};

export default function Home() {
  return (
    <>
      <Inicio />
      {/*
        La sección de próximos eventos aparece en el home solo cuando hay algo
        que anunciar. Para activarla, agrega un evento en `src/app/data/comingSoon.ts`.
        El historial completo vive en su propia página, /events.
      */}
      {hayProximosEventos && <ComingSoon />}
      <Unete />
      <QueremosConocerte />
      <FAQ />
    </>
  );
}
