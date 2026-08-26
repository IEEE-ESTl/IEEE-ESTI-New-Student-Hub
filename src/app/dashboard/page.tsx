import Panel from "@/components/dashboard/Panel";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Panel interno | IEEE ESTl",
    // El panel es de uso interno: fuera de buscadores.
    robots: { index: false, follow: false },
};

export default function DashboardPage() {
    return (
        <main className="min-h-screen pt-24">
            <Panel />
        </main>
    );
}
