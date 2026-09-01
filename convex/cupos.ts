import { query } from "./_generated/server";
import { v } from "convex/values";
import { cupoDe, proximos, slug } from "../src/app/data/comingSoon";

/**
 * Identificadores de los eventos que ya llenaron su cupo.
 *
 * Los formularios la usan para marcar esas opciones como agotadas. Es solo para
 * la interfaz: quien de verdad impide el registro es la verificacion dentro de
 * la mutation, que corre en la misma transaccion que la escritura.
 *
 * Esta query es publica porque la consultan los formularios, que no piden
 * sesion. No expone datos personales: solo dice que evento esta lleno, que es
 * informacion que cualquiera veria al intentar inscribirse.
 *
 * Es reactiva: cuando alguien toma el ultimo lugar, la opcion se marca como
 * agotada en las pantallas de los demas sin que nadie recargue.
 */
export const llenos = query({
    args: {},
    returns: v.array(v.string()),
    handler: async (ctx) => {
        const agotados: string[] = [];

        for (const evento of proximos) {
            const valor = slug(evento.title);
            const cupo = cupoDe(valor);
            if (cupo === null) continue;

            // `.take(cupo)` acota la lectura al tamano del cupo: no hace falta
            // traer todos los registros para saber si ya se lleno.
            const inscritos =
                evento.category === "Taller"
                    ? await ctx.db
                          .query("workshopRegistrations")
                          .withIndex("by_taller", (q) => q.eq("taller", valor))
                          .take(cupo)
                    : await ctx.db
                          .query("eventRegistrations")
                          .withIndex("by_evento", (q) => q.eq("evento", valor))
                          .take(cupo);

            if (inscritos.length >= cupo) agotados.push(valor);
        }

        return agotados;
    },
});
