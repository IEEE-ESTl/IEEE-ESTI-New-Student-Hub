import { Inicio } from "@/components/Inicio";
import { Unete } from "@/components/Unete";
import { FAQ } from "@/components/FAQ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IEEE ESTl",
  description: "IEEE ESTl",
};

export default function Home() {
  return (
    <>
      <Inicio />
      <Unete />
      <FAQ />
    </>
  );
}
