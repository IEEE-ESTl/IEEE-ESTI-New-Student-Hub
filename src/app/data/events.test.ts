import { afterEach, describe, expect, test, vi } from "vitest";
import { eventos, fechaLegible } from "./events";

describe("fechaLegible", () => {
    test("un solo dia", () => {
        expect(fechaLegible({ fecha: "2024-02-16" })).toBe("16 de febrero de 2024");
    });

    test("varios dias del mismo mes", () => {
        expect(fechaLegible({ fecha: "2026-10-26", fechaFin: "2026-10-28" })).toBe(
            "26 al 28 de octubre de 2026",
        );
    });

    test("cruza de un mes a otro", () => {
        expect(fechaLegible({ fecha: "2026-09-30", fechaFin: "2026-10-02" })).toBe(
            "30 de septiembre al 2 de octubre de 2026",
        );
    });

    test("cruza de un año a otro", () => {
        expect(fechaLegible({ fecha: "2026-12-30", fechaFin: "2027-01-02" })).toBe(
            "30 de diciembre de 2026 al 2 de enero de 2027",
        );
    });

    test("fechaFin igual a fecha se trata como un solo dia", () => {
        expect(fechaLegible({ fecha: "2025-08-14", fechaFin: "2025-08-14" })).toBe(
            "14 de agosto de 2025",
        );
    });

    test("no depende de la zona horaria", () => {
        // El 1 de enero a medianoche es la fecha que mas facil se recorre un
        // dia hacia atras si se pasa por un Date en hora de Mexico (UTC-6).
        expect(fechaLegible({ fecha: "2027-01-01" })).toBe("1 de enero de 2027");
    });
});

describe("los datos reales", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetModules();
    });

    test("ninguna fecha del historial ni de los proximos genera aviso", async () => {
        const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});

        // Al importarse, comingSoon.ts revisa duplicados y fechas de las dos
        // listas. Si alguien agrega un evento con "2027-3-5" o con el fin
        // antes del inicio, esta prueba falla y dice cual.
        vi.resetModules();
        await import("./comingSoon");

        expect(aviso.mock.calls.map((c) => c[0])).toEqual([]);
    });

    test("todos los eventos tienen una fecha con forma AAAA-MM-DD", () => {
        for (const evento of eventos) {
            expect(evento.fecha, evento.title).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
    });
});
