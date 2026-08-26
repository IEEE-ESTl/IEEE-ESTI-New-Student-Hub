import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx } from "./_generated/server";

/**
 * Queries que alimentan el dashboard administrativo.
 *
 * ---
 *
 * POR QUE CADA QUERY VERIFICA LA SESION
 *
 * El middleware de Next.js protege la RUTA /dashboard, pero estas funciones son
 * alcanzables por su propia URL de Convex, sin pasar por Next. Confiar solo en
 * el middleware dejaria las respuestas de los estudiantes expuestas a cualquiera
 * que conociera el nombre de la funcion.
 *
 * Son dos capas distintas y ambas hacen falta:
 *   - el middleware evita que se vea la pagina,
 *   - `exigirSesion` evita que se lean los datos.
 *
 * ---
 *
 * SOBRE EL LIMITE DE 500
 *
 * Convex desaconseja `.collect()` sin cota: una tabla que crece sin limite
 * termina reventando la lectura. 500 sobra para el volumen de una rama
 * estudiantil; si algun dia se queda corto, toca paginar de verdad.
 */
const LIMITE = 500;

async function exigirSesion(ctx: QueryCtx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
        throw new Error("No autorizado");
    }
    return userId;
}

export const solicitudesUnion = query({
    args: {},
    handler: async (ctx) => {
        await exigirSesion(ctx);
        return await ctx.db.query("joinRequests").order("desc").take(LIMITE);
    },
});

export const registrosTaller = query({
    args: {},
    handler: async (ctx) => {
        await exigirSesion(ctx);
        return await ctx.db.query("workshopRegistrations").order("desc").take(LIMITE);
    },
});

export const registrosEvento = query({
    args: {},
    handler: async (ctx) => {
        await exigirSesion(ctx);
        return await ctx.db.query("eventRegistrations").order("desc").take(LIMITE);
    },
});

export const interesesEstudiantes = query({
    args: {},
    handler: async (ctx) => {
        await exigirSesion(ctx);
        return await ctx.db.query("studentInterests").order("desc").take(LIMITE);
    },
});

/** Conteos para las pestanas del dashboard. */
export const resumen = query({
    args: {},
    returns: v.object({
        solicitudesUnion: v.number(),
        registrosTaller: v.number(),
        registrosEvento: v.number(),
        interesesEstudiantes: v.number(),
    }),
    handler: async (ctx) => {
        await exigirSesion(ctx);
        return {
            solicitudesUnion: (await ctx.db.query("joinRequests").take(LIMITE)).length,
            registrosTaller: (await ctx.db.query("workshopRegistrations").take(LIMITE)).length,
            registrosEvento: (await ctx.db.query("eventRegistrations").take(LIMITE)).length,
            interesesEstudiantes: (await ctx.db.query("studentInterests").take(LIMITE)).length,
        };
    },
});
