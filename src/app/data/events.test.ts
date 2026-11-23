import { afterEach, describe, expect, test, vi } from "vitest";
import {
    categoriaDesdeParametro,
    conteoPorCategoria,
    eventos,
    fechaCorta,
    fechaLegible,
    historialPorAnio,
    type Evento,
} from "./events";

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

/** Un evento minimo: solo importan la fecha, la categoria y el titulo. */
function ev(id: number, fecha: string, category: Evento["category"], fechaFin?: string): Evento {
    return {
        id,
        title: `Evento ${id}`,
        description: "",
        fullDescription: "",
        fecha: fecha as Evento["fecha"],
        fechaFin: fechaFin as Evento["fechaFin"],
        location: "",
        category,
        instructor: "",
        image: "",
    };
}

describe("fechaCorta", () => {
    test("un dia, sin año", () => {
        expect(fechaCorta({ fecha: "2024-02-16" })).toBe("16 feb");
    });
    test("rango dentro del mismo mes", () => {
        expect(fechaCorta({ fecha: "2026-10-26", fechaFin: "2026-10-28" })).toBe("26–28 oct");
    });
    test("rango que cruza de mes", () => {
        expect(fechaCorta({ fecha: "2026-09-30", fechaFin: "2026-10-02" })).toBe("30 sep – 2 oct");
    });
});

describe("historialPorAnio", () => {
    const lista = [
        ev(1, "2024-02-16", "Taller"),
        ev(2, "2025-08-14", "Evento"),
        ev(3, "2026-10-26", "Evento"),
        ev(4, "2026-10-26", "Taller"),
        ev(5, "2024-10-28", "Congreso"),
    ];

    test("lo mas nuevo primero, agrupado por año", () => {
        const bloques = historialPorAnio(lista);
        expect(bloques.map((b) => b.anio)).toEqual(["2026", "2025", "2024"]);
        expect(bloques[2].eventos.map((e) => e.id)).toEqual([5, 1]);
    });

    test("en empate de fecha respeta el orden de la lista", () => {
        // El evento principal se escribe antes que sus talleres y debe salir primero.
        expect(historialPorAnio(lista)[0].eventos.map((e) => e.id)).toEqual([3, 4]);
    });

    test("al filtrar, los años sin eventos de esa categoria desaparecen", () => {
        const bloques = historialPorAnio(lista, "Taller");
        expect(bloques.map((b) => b.anio)).toEqual(["2026", "2024"]);
        expect(bloques.flatMap((b) => b.eventos).every((e) => e.category === "Taller")).toBe(true);
    });

    test("no altera la lista original", () => {
        const antes = lista.map((e) => e.id);
        historialPorAnio(lista);
        expect(lista.map((e) => e.id)).toEqual(antes);
    });
});

describe("conteoPorCategoria", () => {
    test("solo categorias con eventos, de la mas frecuente a la menos", () => {
        const conteo = conteoPorCategoria([
            ev(1, "2024-01-01", "Taller"),
            ev(2, "2024-01-02", "Taller"),
            ev(3, "2024-01-03", "Congreso"),
        ]);
        expect(conteo).toEqual([
            { categoria: "Taller", total: 2 },
            { categoria: "Congreso", total: 1 },
        ]);
    });

    test("con los datos reales, los totales suman todos los eventos", () => {
        const suma = conteoPorCategoria(eventos).reduce((n, c) => n + c.total, 0);
        expect(suma).toBe(eventos.length);
    });
});

describe("categoriaDesdeParametro", () => {
    test("no distingue mayusculas", () => {
        expect(categoriaDesdeParametro("taller")).toBe("Taller");
        expect(categoriaDesdeParametro("HACKATHON")).toBe("Hackathon");
    });
    test("un valor que no es categoria se ignora en vez de dejar la lista vacia", () => {
        expect(categoriaDesdeParametro("talleres")).toBeUndefined();
        expect(categoriaDesdeParametro(undefined)).toBeUndefined();
        expect(categoriaDesdeParametro("")).toBeUndefined();
    });
});
