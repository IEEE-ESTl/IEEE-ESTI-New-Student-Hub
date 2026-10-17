import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { cupoDe, talleresDelEvento } from "../src/app/data/comingSoon";

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

/**
 * Borra UN registro.
 *
 * Existe aparte de `limpiar` porque son dos gestos distintos: vaciar al cerrar
 * el semestre, y quitar a una persona que se dio de baja. Antes lo segundo
 * obligaba a entrar al panel de Convex.
 *
 * `normalizeId` hace dos cosas: convierte el texto en un identificador y
 * **comprueba que pertenezca a la tabla indicada**. Sin eso, un id de otra
 * tabla llegaria hasta el `delete`.
 */
export const borrarUno = mutation({
    args: {
        tabla: v.union(
            v.literal("workshopRegistrations"),
            v.literal("eventRegistrations"),
            v.literal("joinRequests"),
            v.literal("studentInterests"),
        ),
        id: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await exigirSesion(ctx);

        const noExiste = new ConvexError(
            "Ese registro ya no existe. Puede que alguien lo haya borrado antes que tu.",
        );

        switch (args.tabla) {
            case "workshopRegistrations": {
                const id = ctx.db.normalizeId("workshopRegistrations", args.id);
                if (id === null) throw noExiste;
                await ctx.db.delete("workshopRegistrations", id);
                return null;
            }
            case "eventRegistrations": {
                const id = ctx.db.normalizeId("eventRegistrations", args.id);
                if (id === null) throw noExiste;
                await ctx.db.delete("eventRegistrations", id);
                return null;
            }
            case "joinRequests": {
                const id = ctx.db.normalizeId("joinRequests", args.id);
                if (id === null) throw noExiste;
                await ctx.db.delete("joinRequests", id);
                return null;
            }
            case "studentInterests": {
                const id = ctx.db.normalizeId("studentInterests", args.id);
                if (id === null) throw noExiste;
                await ctx.db.delete("studentInterests", id);
                return null;
            }
        }
    },
});

/**
 * Cambia de taller a un alumno ya inscrito.
 *
 * ---
 *
 * POR QUE ESTO NO DESCUADRA EL CUPO
 *
 * No existe ningun contador de lugares que haya que subir y bajar. El cupo se
 * calcula contando los registros que apuntan a cada taller, con el indice
 * `by_taller`. Asi que mover a alguien es **cambiar un campo de un documento**:
 * el taller de origen pierde una fila y el destino gana una, los dos conteos se
 * corrigen solos y el lugar anterior queda libre en el mismo instante.
 *
 * Si el cupo viviera en un numero aparte, mover a alguien serian tres
 * escrituras que podrian desincronizarse. Aqui es una, y no hay estado que
 * pueda quedar a medias.
 *
 * Todo corre dentro de una mutation, que en Convex es una transaccion: la
 * comprobacion de cupo y el cambio ocurren sin que nadie se cuele en medio. Si
 * dos personas del staff mueven alumnos al ultimo lugar libre a la vez, solo
 * una lo consigue.
 */
export const moverTaller = mutation({
    args: {
        id: v.string(),
        taller: v.string(),
    },
    returns: v.object({ de: v.string(), a: v.string() }),
    handler: async (ctx, args) => {
        await exigirSesion(ctx);

        const id = ctx.db.normalizeId("workshopRegistrations", args.id);
        if (id === null) {
            throw new ConvexError("Ese registro ya no existe.");
        }

        const registro = await ctx.db.get("workshopRegistrations", id);
        if (registro === null) {
            throw new ConvexError(
                "Ese registro ya no existe. Puede que alguien lo haya borrado antes que tu.",
            );
        }

        // El destino se valida contra los datos del evento, no contra lo que
        // mande el navegador: asi no se puede dejar a un alumno apuntando a un
        // taller inventado, que luego apareceria vacio en el panel.
        const destino = talleresDelEvento().find((t) => t.valor === args.taller);
        if (destino === undefined) {
            throw new ConvexError("Ese taller no existe en los datos del evento.");
        }

        if (registro.taller === args.taller) {
            throw new ConvexError(`Ya esta inscrito en "${destino.etiqueta}".`);
        }

        // Defensa por si en la tabla quedaran registros repetidos de antes de
        // que existiera la regla de un taller por alumno: mover no debe dejar
        // a la misma cuenta dos veces en el mismo taller.
        const suyos = await ctx.db
            .query("workshopRegistrations")
            .withIndex("by_numeroCuenta", (q) => q.eq("numeroCuenta", registro.numeroCuenta))
            .take(10);
        if (suyos.some((r) => r._id !== registro._id && r.taller === args.taller)) {
            throw new ConvexError(
                `Esta cuenta ya tiene otro registro en "${destino.etiqueta}".`,
            );
        }

        // El cupo se respeta aunque mueva la mesa directiva. Si no, el limite
        // dejaria de significar algo en cuanto alguien empezara a mover gente.
        const cupo = cupoDe(args.taller);
        if (cupo !== null) {
            const inscritos = await ctx.db
                .query("workshopRegistrations")
                .withIndex("by_taller", (q) => q.eq("taller", args.taller))
                .take(cupo);
            if (inscritos.length >= cupo) {
                throw new ConvexError(
                    `"${destino.etiqueta}" ya tiene sus ${cupo} lugares ocupados. Libera uno antes de mover a alguien ahi.`,
                );
            }
        }

        const de = registro.taller;
        await ctx.db.patch("workshopRegistrations", id, { taller: args.taller });
        return { de, a: args.taller };
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
