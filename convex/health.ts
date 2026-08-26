import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query de diagnóstico. Solo sirve para confirmar que la conexión con Convex
 * funciona y que las cuatro tablas del esquema están desplegadas.
 *
 * TEMPORAL: se elimina en la Fase 6, cuando el dashboard traiga sus propias
 * queries reales en `convex/admin.ts`.
 *
 * El conteo está acotado a 100 por tabla a propósito: Convex no tiene un
 * operador de conteo, y leer una tabla completa deja de escalar en cuanto crece.
 *
 * Es `internalQuery`, no `query`: no queda expuesta a internet. Se sigue pudiendo
 * ejecutar desde la CLI con `bunx convex run health:estado`.
 */
export const estado = internalQuery({
    args: {},
    returns: v.object({
        joinRequests: v.number(),
        workshopRegistrations: v.number(),
        eventRegistrations: v.number(),
        studentInterests: v.number(),
    }),
    handler: async (ctx) => {
        return {
            joinRequests: (await ctx.db.query("joinRequests").take(100)).length,
            workshopRegistrations: (await ctx.db.query("workshopRegistrations").take(100)).length,
            eventRegistrations: (await ctx.db.query("eventRegistrations").take(100)).length,
            studentInterests: (await ctx.db.query("studentInterests").take(100)).length,
        };
    },
});
