/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { cupoDe, talleresDelEvento } from "../src/app/data/comingSoon";

/**
 * Pruebas del panel: borrar un registro y mover a un alumno de taller.
 *
 * Lo que de verdad importa comprobar aqui es que mover a alguien **libere el
 * lugar anterior**. No hay un contador de lugares que se pueda desincronizar
 * —el cupo se cuenta leyendo los registros— pero eso hay que demostrarlo, no
 * afirmarlo: la ultima prueba llena un taller, saca a una persona y verifica
 * que alguien nuevo puede entrar.
 *
 * Los talleres NO se escriben a mano: se leen de `comingSoon.ts`, que es de
 * donde los leen tambien las funciones. Asi las pruebas siguen valiendo cuando
 * cambien los datos del evento, en vez de romperse al archivar WIEEEK.
 */

const TALLERES = talleresDelEvento();
const [PRIMERO, SEGUNDO] = TALLERES;

/**
 * Levanta un backend en memoria.
 *
 * Va en una funcion y no suelto en cada prueba para que TypeScript conserve el
 * esquema: con `ReturnType<typeof convexTest>` a secas se pierde, y `ctx.db`
 * deja de conocer los indices de las tablas.
 */
function crear() {
    return convexTest(schema, import.meta.glob("./**/*.*s"));
}

type Harness = ReturnType<typeof crear>;

/** Abre una sesion de panel, que es lo que `exigirSesion` pide. */
async function conSesion(t: Harness) {
    const usuario = await t.run(async (ctx) => await ctx.db.insert("users", {}));
    // Convex Auth arma el `subject` como `<idDeUsuario>|<idDeSesion>`.
    return t.withIdentity({ subject: `${usuario}|sesion-de-prueba` });
}

/** Inscribe a alguien directamente, sin pasar por las validaciones del alta. */
async function inscribir(
    t: Harness,
    numeroCuenta: string,
    taller: string,
) {
    return await t.run(
        async (ctx) =>
            await ctx.db.insert("workshopRegistrations", {
                nombreCompleto: `Alumno ${numeroCuenta}`,
                email: `a${numeroCuenta}@uaeh.edu.mx`,
                numeroCuenta,
                grupo: "101",
                taller,
            }),
    );
}

/** Cuantos registros tiene un taller ahora mismo. */
async function cuantos(t: Harness, taller: string) {
    return await t.run(async (ctx) => {
        const filas = await ctx.db
            .query("workshopRegistrations")
            .withIndex("by_taller", (q) => q.eq("taller", taller))
            .take(500);
        return filas.length;
    });
}

describe("admin.moverTaller", () => {
    test("libera el lugar del taller anterior y ocupa el nuevo", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const id = await inscribir(t, "490001", PRIMERO.valor);
        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
        expect(await cuantos(t, SEGUNDO.valor)).toBe(0);

        const resultado = await sesion.mutation(api.admin.moverTaller, {
            id,
            taller: SEGUNDO.valor,
        });

        expect(resultado).toEqual({ de: PRIMERO.valor, a: SEGUNDO.valor });
        expect(await cuantos(t, PRIMERO.valor)).toBe(0);
        expect(await cuantos(t, SEGUNDO.valor)).toBe(1);
    });

    test("conserva los datos del alumno y no duplica la fila", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const id = await inscribir(t, "490002", PRIMERO.valor);
        await sesion.mutation(api.admin.moverTaller, { id, taller: SEGUNDO.valor });

        const filas = await t.run(
            async (ctx) => await ctx.db.query("workshopRegistrations").take(100),
        );

        // Mover es cambiar un campo, no borrar e insertar: sigue siendo la
        // misma fila, con el mismo identificador y los mismos datos.
        expect(filas).toHaveLength(1);
        expect(filas[0]._id).toBe(id);
        expect(filas[0].taller).toBe(SEGUNDO.valor);
        expect(filas[0].numeroCuenta).toBe("490002");
        expect(filas[0].nombreCompleto).toBe("Alumno 490002");
        expect(filas[0].email).toBe("a490002@uaeh.edu.mx");
        expect(filas[0].grupo).toBe("101");
    });

    test("respeta el cupo del taller de destino", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const cupo = cupoDe(SEGUNDO.valor);
        expect(cupo).not.toBeNull();

        // El destino se llena por completo.
        for (let i = 0; i < cupo!; i++) {
            await inscribir(t, String(491000 + i), SEGUNDO.valor);
        }

        const id = await inscribir(t, "490003", PRIMERO.valor);

        await expect(
            sesion.mutation(api.admin.moverTaller, { id, taller: SEGUNDO.valor }),
        ).rejects.toThrow(/lugares ocupados/);

        // Y lo importante: el alumno se queda donde estaba, no en el limbo.
        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
        expect(await cuantos(t, SEGUNDO.valor)).toBe(cupo);
    });

    test("rechaza un taller que no existe en los datos", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const id = await inscribir(t, "490004", PRIMERO.valor);

        await expect(
            sesion.mutation(api.admin.moverTaller, { id, taller: "taller-inventado" }),
        ).rejects.toThrow(/no existe en los datos/);

        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
    });

    test("rechaza mover al mismo taller en el que ya esta", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const id = await inscribir(t, "490005", PRIMERO.valor);

        await expect(
            sesion.mutation(api.admin.moverTaller, { id, taller: PRIMERO.valor }),
        ).rejects.toThrow(/Ya esta inscrito/);
    });

    test("no deja a la misma cuenta dos veces en el mismo taller", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        // Dos filas de la misma cuenta, como podrian haber quedado antes de
        // que existiera la regla de un taller por alumno.
        const id = await inscribir(t, "490006", PRIMERO.valor);
        await inscribir(t, "490006", SEGUNDO.valor);

        await expect(
            sesion.mutation(api.admin.moverTaller, { id, taller: SEGUNDO.valor }),
        ).rejects.toThrow(/ya tiene otro registro/);
    });

    test("rechaza un registro que ya no existe", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const id = await inscribir(t, "490007", PRIMERO.valor);
        await sesion.mutation(api.admin.borrarUno, {
            tabla: "workshopRegistrations",
            id,
        });

        await expect(
            sesion.mutation(api.admin.moverTaller, { id, taller: SEGUNDO.valor }),
        ).rejects.toThrow(/ya no existe/);
    });

    test("exige sesion", async () => {
        const t = crear();
        const id = await inscribir(t, "490008", PRIMERO.valor);

        await expect(
            t.mutation(api.admin.moverTaller, { id, taller: SEGUNDO.valor }),
        ).rejects.toThrow(/No autorizado/);

        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
    });
});

describe("admin.borrarUno", () => {
    test("borra solo el registro indicado", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const unoId = await inscribir(t, "490010", PRIMERO.valor);
        await inscribir(t, "490011", PRIMERO.valor);
        await inscribir(t, "490012", SEGUNDO.valor);

        await sesion.mutation(api.admin.borrarUno, {
            tabla: "workshopRegistrations",
            id: unoId,
        });

        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
        expect(await cuantos(t, SEGUNDO.valor)).toBe(1);

        const quedan = await t.run(
            async (ctx) => await ctx.db.query("workshopRegistrations").take(100),
        );
        expect(quedan.map((f) => f.numeroCuenta).sort()).toEqual(["490011", "490012"]);
    });

    test("no borra si el id pertenece a otra tabla", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const id = await inscribir(t, "490013", PRIMERO.valor);

        // El id es real, pero se pide borrarlo de la tabla equivocada.
        // `normalizeId` lo detecta; sin el, el borrado llegaria a la base.
        await expect(
            sesion.mutation(api.admin.borrarUno, { tabla: "joinRequests", id }),
        ).rejects.toThrow(/ya no existe/);

        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
    });

    test("exige sesion", async () => {
        const t = crear();
        const id = await inscribir(t, "490014", PRIMERO.valor);

        await expect(
            t.mutation(api.admin.borrarUno, { tabla: "workshopRegistrations", id }),
        ).rejects.toThrow(/No autorizado/);

        expect(await cuantos(t, PRIMERO.valor)).toBe(1);
    });
});

describe("el lugar liberado se puede volver a ocupar", () => {
    test("tras mover a alguien, un alumno nuevo entra al taller que estaba lleno", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const cupo = cupoDe(PRIMERO.valor)!;

        // Se llena el primer taller hasta el tope.
        const ids: string[] = [];
        for (let i = 0; i < cupo; i++) {
            ids.push(await inscribir(t, String(492000 + i), PRIMERO.valor));
        }

        // Con el taller lleno, nadie mas puede inscribirse por el formulario.
        await expect(
            t.mutation(api.workshops.registrar, {
                nombreCompleto: "Alumna Nueva",
                email: "nueva@uaeh.edu.mx",
                numeroCuenta: "493000",
                grupo: "101",
                taller: PRIMERO.valor,
            }),
        ).rejects.toThrow(/cupo maximo/);

        // La mesa directiva mueve a una persona al otro taller.
        await sesion.mutation(api.admin.moverTaller, {
            id: ids[0],
            taller: SEGUNDO.valor,
        });

        // Y ahora si entra: el lugar quedo libre de verdad.
        await t.mutation(api.workshops.registrar, {
            nombreCompleto: "Alumna Nueva",
            email: "nueva@uaeh.edu.mx",
            numeroCuenta: "493000",
            grupo: "101",
            taller: PRIMERO.valor,
        });

        expect(await cuantos(t, PRIMERO.valor)).toBe(cupo);
        expect(await cuantos(t, SEGUNDO.valor)).toBe(1);
    });

    test("tras borrar un registro, el lugar tambien queda libre", async () => {
        const t = crear();
        const sesion = await conSesion(t);

        const cupo = cupoDe(PRIMERO.valor)!;
        const ids: string[] = [];
        for (let i = 0; i < cupo; i++) {
            ids.push(await inscribir(t, String(494000 + i), PRIMERO.valor));
        }

        await sesion.mutation(api.admin.borrarUno, {
            tabla: "workshopRegistrations",
            id: ids[0],
        });

        await t.mutation(api.workshops.registrar, {
            nombreCompleto: "Alumno Nuevo",
            email: "nuevo@uaeh.edu.mx",
            numeroCuenta: "495000",
            grupo: "101",
            taller: PRIMERO.valor,
        });

        expect(await cuantos(t, PRIMERO.valor)).toBe(cupo);
    });
});
