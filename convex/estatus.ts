import { query } from "./_generated/server";
import { v } from "convex/values";
import { esEmail, esNumeroCuenta, limpiar } from "./validaciones";
import { proximos, slug } from "../src/app/data/comingSoon";

/**
 * Consulta publica: "¿en que taller quede?".
 *
 * ---
 *
 * ESTA QUERY ES PUBLICA Y DEVUELVE DATOS DE PERSONAS. QUE SE HACE AL RESPECTO
 *
 * No pide sesion, porque el alumno que quiere saber su taller no tiene cuenta
 * en ningun lado. Eso obliga a ser cuidadoso con lo que devuelve, porque los
 * numeros de cuenta son seis digitos y predecibles: quien quiera puede
 * recorrerlos todos con un script.
 *
 * Tres decisiones para limitar el daño:
 *
 *   1. **Nunca devuelve el correo.** Es el dato con el que se puede contactar
 *      o suplantar a alguien, y quien consulta ya lo sabe si busco por el.
 *   2. **El nombre va enmascarado** ("Abdiel A. N."): suficiente para que
 *      quien consulta se reconozca, insuficiente para armar un padron.
 *   3. **Solo coincidencias exactas.** El identificador tiene que ser un
 *      numero de cuenta de 6 digitos o un correo completo; no hay busqueda
 *      parcial ni por nombre, asi que no se puede pescar.
 *
 * Lo que sigue siendo cierto: con un numero de cuenta valido se averigua el
 * nombre de pila, el grupo y el taller de esa persona. Es el precio de que la
 * consulta sea publica. Si algun dia estorba, la forma de cerrarlo sin pedir
 * cuenta es exigir numero **y** correo a la vez.
 */

/**
 * "Abdiel Avila Neri" -> "Abdiel A. N."
 *
 * Deja el nombre de pila completo y reduce lo demas a iniciales. Quien
 * consulta se reconoce al instante; quien husmea se lleva mucho menos.
 */
function enmascarar(nombre: string): string {
    const partes = limpiar(nombre).split(" ").filter(Boolean);
    if (partes.length <= 1) return partes[0] ?? "";
    const [pila, ...resto] = partes;
    return [pila, ...resto.map((p) => `${p[0].toUpperCase()}.`)].join(" ");
}

/** Los datos del evento que acompañan a una inscripcion. */
function datosDelEvento(valor: string) {
    const evento = proximos.find((e) => slug(e.title) === valor);
    return {
        titulo: evento?.title ?? valor,
        categoria: evento?.category ?? "Evento",
        fecha: evento?.date ?? "",
        lugar: evento?.location ?? "",
        instructor: evento?.instructor ?? "",
    };
}

const inscripcion = v.object({
    tipo: v.union(v.literal("Taller"), v.literal("Evento")),
    titulo: v.string(),
    categoria: v.string(),
    fecha: v.string(),
    lugar: v.string(),
    instructor: v.string(),
    alumno: v.string(),
    grupo: v.string(),
    numeroCuenta: v.optional(v.string()),
    registradoEn: v.number(),
    referencia: v.string(),
});

export const consultar = query({
    args: { identificador: v.string() },
    returns: v.object({
        // `null` significa "el identificador no tiene forma valida"; una lista
        // vacia significa "es valido pero no hay nada a su nombre". Son cosas
        // distintas y la pantalla las explica distinto.
        valido: v.boolean(),
        inscripciones: v.array(inscripcion),
    }),
    handler: async (ctx, args) => {
        const identificador = limpiar(args.identificador);
        const porCuenta = esNumeroCuenta(identificador);
        const correo = identificador.toLowerCase();
        const porCorreo = esEmail(correo);

        if (!porCuenta && !porCorreo) {
            return { valido: false, inscripciones: [] };
        }

        const inscripciones = [];

        // Talleres: se encuentran por cuenta o por correo.
        const talleres = porCuenta
            ? await ctx.db
                  .query("workshopRegistrations")
                  .withIndex("by_numeroCuenta", (q) => q.eq("numeroCuenta", identificador))
                  .take(10)
            : await ctx.db
                  .query("workshopRegistrations")
                  .withIndex("by_email", (q) => q.eq("email", correo))
                  .take(10);

        for (const fila of talleres) {
            inscripciones.push({
                tipo: "Taller" as const,
                ...datosDelEvento(fila.taller),
                alumno: enmascarar(fila.nombreCompleto),
                grupo: fila.grupo,
                numeroCuenta: fila.numeroCuenta,
                registradoEn: fila._creationTime,
                // Los ultimos 6 caracteres del identificador del documento.
                // Sirve para que el alumno cite algo concreto al escribirnos,
                // sin exponer el identificador completo.
                referencia: fila._id.slice(-6).toUpperCase(),
            });
        }

        // Eventos: solo por correo, porque el formulario de eventos no pide
        // numero de cuenta (acepta externos, que no tienen).
        if (porCorreo) {
            const eventos = await ctx.db
                .query("eventRegistrations")
                .withIndex("by_email", (q) => q.eq("email", correo))
                .take(10);

            for (const fila of eventos) {
                inscripciones.push({
                    tipo: "Evento" as const,
                    ...datosDelEvento(fila.evento),
                    alumno: enmascarar(fila.nombreCompleto),
                    grupo: fila.grupo === "external" ? "Externo" : fila.grupo,
                    numeroCuenta: undefined,
                    registradoEn: fila._creationTime,
                    referencia: fila._id.slice(-6).toUpperCase(),
                });
            }
        }

        inscripciones.sort((a, b) => a.registradoEn - b.registradoEn);

        return { valido: true, inscripciones };
    },
});
