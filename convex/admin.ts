import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

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

async function exigirSesion(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
        throw new ConvexError("No autorizado");
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

/**
 * Cuantos registros se borran por llamada.
 *
 * Las mutations de Convex son transacciones con un tope de documentos y bytes;
 * borrar una tabla entera de un golpe puede pasarse de ese tope. En vez de
 * adivinar cuantos caben, cada llamada borra como mucho un lote y dice si
 * quedaron mas, y el panel vuelve a llamar hasta que no queda ninguno.
 *
 * El efecto secundario es util: el borrado avanza por partes, asi que si algo
 * falla a la mitad lo ya borrado sigue borrado y se puede reintentar.
 */
const LOTE = 200;

/**
 * Borra registros del panel.
 *
 * Es la unica funcion de todo el proyecto que destruye datos, asi que vale la
 * pena decir que la protege:
 *
 *   - Exige sesion, igual que las queries. El middleware de Next no basta:
 *     esta funcion es alcanzable por su propia URL de Convex.
 *   - `valor` restringe el borrado a un solo taller o evento. El panel lo manda
 *     siempre que haya un filtro puesto, para que "limpiar" se lleve lo que se
 *     esta viendo y no la tabla completa.
 *
 * Lo que NO hace: pedir confirmacion. Eso vive en el panel, porque aqui no hay
 * a quien preguntarle.
 */
export const limpiar = mutation({
    args: {
        tabla: v.union(
            v.literal("workshopRegistrations"),
            v.literal("eventRegistrations"),
            v.literal("joinRequests"),
            v.literal("studentInterests"),
        ),
        // Taller o evento concreto. Sin esto se borra la tabla entera.
        valor: v.optional(v.string()),
    },
    returns: v.object({ borrados: v.number(), hayMas: v.boolean() }),
    handler: async (ctx, args) => {
        await exigirSesion(ctx);

        // El switch parece repetitivo, pero es lo que hace que TypeScript
        // compruebe que el indice existe en la tabla que se esta borrando:
        // con un nombre de tabla generico no podria.
        switch (args.tabla) {
            case "workshopRegistrations": {
                const valor = args.valor;
                const filas =
                    valor === undefined
                        ? await ctx.db.query("workshopRegistrations").take(LOTE)
                        : await ctx.db
                              .query("workshopRegistrations")
                              .withIndex("by_taller", (q) => q.eq("taller", valor))
                              .take(LOTE);
                for (const fila of filas) {
                    await ctx.db.delete("workshopRegistrations", fila._id);
                }
                return { borrados: filas.length, hayMas: filas.length === LOTE };
            }

            case "eventRegistrations": {
                const valor = args.valor;
                const filas =
                    valor === undefined
                        ? await ctx.db.query("eventRegistrations").take(LOTE)
                        : await ctx.db
                              .query("eventRegistrations")
                              .withIndex("by_evento", (q) => q.eq("evento", valor))
                              .take(LOTE);
                for (const fila of filas) {
                    await ctx.db.delete("eventRegistrations", fila._id);
                }
                return { borrados: filas.length, hayMas: filas.length === LOTE };
            }

            case "joinRequests": {
                const filas = await ctx.db.query("joinRequests").take(LOTE);
                for (const fila of filas) {
                    await ctx.db.delete("joinRequests", fila._id);
                }
                return { borrados: filas.length, hayMas: filas.length === LOTE };
            }

            case "studentInterests": {
                const filas = await ctx.db.query("studentInterests").take(LOTE);
                for (const fila of filas) {
                    await ctx.db.delete("studentInterests", fila._id);
                }
                return { borrados: filas.length, hayMas: filas.length === LOTE };
            }
        }
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
