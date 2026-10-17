/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { talleresDelEvento } from "../src/app/data/comingSoon";

/**
 * Pruebas de la consulta publica de estatus.
 *
 * Esta query no pide sesion y devuelve datos de personas, asi que lo que mas
 * importa comprobar no es que encuentre, sino **que no filtre de mas**: hay una
 * prueba dedicada a que el correo no salga jamas en la respuesta.
 */

const [PRIMERO] = talleresDelEvento();

function crear() {
    return convexTest(schema, import.meta.glob("./**/*.*s"));
}

type Harness = ReturnType<typeof crear>;

async function inscribirTaller(
    t: Harness,
    datos: { nombreCompleto: string; email: string; numeroCuenta: string },
) {
    return await t.run(
        async (ctx) =>
            await ctx.db.insert("workshopRegistrations", {
                ...datos,
                grupo: "702",
                taller: PRIMERO.valor,
            }),
    );
}

describe("estatus.consultar", () => {
    test("encuentra la inscripcion por numero de cuenta", async () => {
        const t = crear();
        await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        const r = await t.query(api.estatus.consultar, { identificador: "446034" });

        expect(r.valido).toBe(true);
        expect(r.inscripciones).toHaveLength(1);
        expect(r.inscripciones[0].titulo).toBe(PRIMERO.etiqueta);
        expect(r.inscripciones[0].tipo).toBe("Taller");
        expect(r.inscripciones[0].numeroCuenta).toBe("446034");
        expect(r.inscripciones[0].grupo).toBe("702");
    });

    test("encuentra la inscripcion por correo, sin importar mayusculas", async () => {
        const t = crear();
        await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        const r = await t.query(api.estatus.consultar, {
            identificador: "  ABDIEL@uaeh.edu.mx  ",
        });

        expect(r.valido).toBe(true);
        expect(r.inscripciones).toHaveLength(1);
    });

    test("NUNCA devuelve el correo del alumno", async () => {
        const t = crear();
        await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        const r = await t.query(api.estatus.consultar, { identificador: "446034" });

        // Se revisa la respuesta entera, no campo por campo: asi la prueba
        // sigue protegiendo aunque alguien agregue campos nuevos mañana.
        expect(JSON.stringify(r)).not.toContain("abdiel@uaeh.edu.mx");
        expect(JSON.stringify(r)).not.toContain("uaeh.edu.mx");
    });

    test("enmascara los apellidos", async () => {
        const t = crear();
        await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        const r = await t.query(api.estatus.consultar, { identificador: "446034" });

        expect(r.inscripciones[0].alumno).toBe("Abdiel A. N.");
        expect(JSON.stringify(r)).not.toContain("Avila");
        expect(JSON.stringify(r)).not.toContain("Neri");
    });

    test("distingue entre identificador mal escrito y sin inscripcion", async () => {
        const t = crear();

        // Ni 6 digitos ni un correo: no tiene forma de identificador.
        const malEscrito = await t.query(api.estatus.consultar, { identificador: "abc" });
        expect(malEscrito.valido).toBe(false);
        expect(malEscrito.inscripciones).toHaveLength(0);

        // Forma valida, pero no hay nadie con ese numero.
        const sinRegistro = await t.query(api.estatus.consultar, { identificador: "999999" });
        expect(sinRegistro.valido).toBe(true);
        expect(sinRegistro.inscripciones).toHaveLength(0);
    });

    test("no permite buscar por nombre ni por fragmentos", async () => {
        const t = crear();
        await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        for (const intento of ["Abdiel", "4460", "446", "@uaeh.edu.mx", ""]) {
            const r = await t.query(api.estatus.consultar, { identificador: intento });
            expect(r.inscripciones).toHaveLength(0);
        }
    });

    test("junta el taller y el evento de la misma persona", async () => {
        const t = crear();

        await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        await t.run(
            async (ctx) =>
                await ctx.db.insert("eventRegistrations", {
                    nombreCompleto: "Abdiel Avila Neri",
                    email: "abdiel@uaeh.edu.mx",
                    telefono: "7711234567",
                    grupo: "external",
                    evento: "torneo-e-sports",
                }),
        );

        // Por correo salen los dos.
        const porCorreo = await t.query(api.estatus.consultar, {
            identificador: "abdiel@uaeh.edu.mx",
        });
        expect(porCorreo.inscripciones).toHaveLength(2);
        expect(porCorreo.inscripciones.map((i) => i.tipo)).toEqual(["Taller", "Evento"]);
        expect(porCorreo.inscripciones[1].grupo).toBe("Externo");

        // Por numero de cuenta solo el taller: el formulario de eventos no
        // pide cuenta, porque acepta externos que no tienen.
        const porCuenta = await t.query(api.estatus.consultar, { identificador: "446034" });
        expect(porCuenta.inscripciones).toHaveLength(1);
        expect(porCuenta.inscripciones[0].tipo).toBe("Taller");
    });

    test("refleja el taller nuevo despues de que el panel mueva a alguien", async () => {
        const t = crear();
        const [, SEGUNDO] = talleresDelEvento();

        const id = await inscribirTaller(t, {
            nombreCompleto: "Abdiel Avila Neri",
            email: "abdiel@uaeh.edu.mx",
            numeroCuenta: "446034",
        });

        const usuario = await t.run(async (ctx) => await ctx.db.insert("users", {}));
        await t
            .withIdentity({ subject: `${usuario}|sesion-de-prueba` })
            .mutation(api.admin.moverTaller, { id, taller: SEGUNDO.valor });

        const r = await t.query(api.estatus.consultar, { identificador: "446034" });

        expect(r.inscripciones).toHaveLength(1);
        expect(r.inscripciones[0].titulo).toBe(SEGUNDO.etiqueta);
    });
});
