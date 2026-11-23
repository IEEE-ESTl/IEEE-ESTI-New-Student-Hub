import { afterEach, describe, expect, test, vi } from "vitest";
import { aceptaInscripciones, proximosOrdenados, type Proximo } from "./comingSoon";

/** Un proximo minimo: solo importan la fecha y los campos de registro. */
function px(id: number, fecha: string, extra: Partial<Proximo> = {}): Proximo {
    return {
        id,
        title: `Evento ${id}`,
        description: "",
        fullDescription: "",
        fecha: fecha as Proximo["fecha"],
        location: "",
        category: "Taller",
        instructor: "",
        image: "",
        ...extra,
    };
}

describe("proximosOrdenados", () => {
    test("del mas cercano al mas lejano", () => {
        const lista = [px(1, "2027-05-10"), px(2, "2027-03-01"), px(3, "2027-04-15")];
        expect(proximosOrdenados(lista).map((e) => e.id)).toEqual([2, 3, 1]);
    });

    test("en empate respeta el orden de la lista", () => {
        // El evento principal se escribe antes que sus talleres y debe salir primero.
        const lista = [px(1, "2027-03-01"), px(2, "2027-03-01"), px(3, "2027-02-01")];
        expect(proximosOrdenados(lista).map((e) => e.id)).toEqual([3, 1, 2]);
    });
});

describe("aceptaInscripciones", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test("con el registro abierto y sin fecha limite", () => {
        expect(aceptaInscripciones(px(1, "2027-03-01", { registroAbierto: true }))).toBe(true);
    });

    test("con un enlace externo, aunque el formulario propio este cerrado", () => {
        expect(
            aceptaInscripciones(px(1, "2027-03-01", { registerLink: "https://ejemplo.com" })),
        ).toBe(true);
    });

    test("anunciado sin inscripcion", () => {
        expect(aceptaInscripciones(px(1, "2027-03-01"))).toBe(false);
        expect(aceptaInscripciones(px(1, "2027-03-01", { registroAbierto: false }))).toBe(false);
    });

    test("deja de aceptar al pasar la fecha limite", () => {
        const evento = px(1, "2027-03-10", { registroAbierto: true, fechaLimiteRegistro: "2027-03-01" });

        // Mediodia en Hidalgo (UTC-6) del ultimo dia: todavia acepta.
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2027-03-01T18:00:00Z"));
        expect(aceptaInscripciones(evento)).toBe(true);

        // Al dia siguiente, ya no.
        vi.setSystemTime(new Date("2027-03-02T18:00:00Z"));
        expect(aceptaInscripciones(evento)).toBe(false);
    });
});
