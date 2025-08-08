// src/app/members/page.tsx
import { bebasNeue, jetBrainsMono } from "@/lib/fonts";
import { members } from "../data/members";
import { exMembers } from "../data/exMembers";
import MemberCard from "@/components/MemberCard";
import { BlurFade } from "@/components/magicui/blur-fade";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "IEEE ESTl | Miembros",
    description: "IEEE ESTl | Miembros",
};

export default function Members() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="w-full max-w-7xl mx-auto">
                <h1 className={`${bebasNeue.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#0371a4] text-center mb-8 mt-14 sm:mb-12 lg:mb-16`}>
                    Miembros
                </h1>
                <div className="flex flex-col items-center justify-center lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
                    {members.map((member, idx) => (
                        <BlurFade 
                            delay={0.15 + idx * 0.05} 
                            inView 
                            key={member.name}
                        >
                            <MemberCard member={member} />
                        </BlurFade>
                    ))}
                </div>
            </div>
            <div className="w-full max-w-7xl mx-auto">
                <h1 className={`${bebasNeue.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#0371a4] text-center mb-8 mt-14 sm:mb-12 lg:mb-16`}>
                    Ex-Miembros
                </h1>
                <div className="flex flex-col items-center justify-center lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
                    {exMembers.map((member, idx) => (
                        <BlurFade 
                            delay={0.15 + idx * 0.05} 
                            inView 
                            key={member.name}
                        >
                            <MemberCard member={member} />
                        </BlurFade>
                    ))}
                </div>
            </div>
        </main>
    )
}