import { Inicio } from "@/components/Inicio";
import { Unete } from "@/components/Unete";
import { FAQ } from "@/components/FAQ";
import Events from "@/components/Events";
import ComingSoon from "@/components/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IEEE ESTl",
  description: "IEEE ESTl",
};

export default function Home() {
  return (
    <>
      <Inicio />
      <Events />
      <ComingSoon />
      <Unete />
      <FAQ />
    </>
  );
}
