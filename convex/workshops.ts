import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { esEmailUaeh, esNumeroCuenta, exigir, limpiar } from "./validaciones";
import { cupoDe, tituloDe } from "../src/app/data/comingSoon";

/**
 * Registra a un alumno en un taller.
 *
 * Reemplaza al `supabase.from("ieee-workshops").insert()` que corría en el
 * navegador. La diferencia: aquí el navegador no tiene credenciales de base de
 * datos, solo puede pedir que se ejecute esta función.
 */
export const registrar = mutation({
    args: {
        nombreCompleto: v.string(),
        email: v.string(),
        numeroCuenta: v.string(),
        grupo: v.string(),
        taller: v.string(),
    },
    returns: v.id("workshopRegistrations"),
    handler: async (ctx, args) => {
        const nombreCompleto = limpiar(args.nombreCompleto);
        const email = limpiar(args.email).toLowerCase();
        const numeroCuenta = limpiar(args.numeroCuenta);

        exigir(nombreCompleto.length >= 3, "El nombre completo debe tener al menos 3 caracteres");
        exigir(esEmailUaeh(email), "El correo debe ser institucional de la UAEH (@uaeh.edu.mx)");
        exigir(esNumeroCuenta(numeroCuenta), "El número de cuenta son 6 dígitos, sin espacios");
        exigir(args.grupo.length > 0, "El grupo es requerido");
        exigir(args.taller.length > 0, "El taller es requerido");

        // Un taller por alumno.
        //
        // Va antes del cupo porque es el aviso mas util: a quien ya tiene lugar
        // no le sirve enterarse de que el taller se lleno.
        //
        // La busqueda es por indice, no recorriendo la tabla: con el cupo lleno
        // son 140 registros, y leerlos todos en cada intento de alta se nota.
        const previo = await ctx.db
            .query("workshopRegistrations")
            .withIndex("by_numeroCuenta", (q) => q.eq("numeroCuenta", numeroCuenta))
            .first();

        if (previo !== null) {
            // Dos mensajes distintos porque son dos situaciones distintas: una
            // es un clic repetido, la otra es alguien que quiere cambiarse o no
            // sabia de la regla. Nombrar el taller le evita adivinar.
            throw new ConvexError(
                previo.taller === args.taller
                    ? `Este número de cuenta ya está registrado en "${tituloDe(args.taller)}". No hace falta inscribirse otra vez.`
                    : `Este número de cuenta ya está registrado en "${tituloDe(previo.taller)}". Solo puedes inscribirte a un taller. Si necesitas cambiarte, escríbenos.`,
            );
        }

        // Control de cupo. Va DENTRO de la mutation a proposito: las mutations de
        // Convex son transacciones, asi que contar e insertar ocurre sin que nadie
        // se cuele en medio. Si dos personas envian a la vez y queda un lugar,
        // solo una entra.
        //
        // El cupo se lee del archivo de datos, no de lo que mande el navegador:
        // un cliente podria enviar cualquier numero.
        const cupo = cupoDe(args.taller);
        if (cupo !== null) {
            const inscritos = await ctx.db
                .query("workshopRegistrations")
                .withIndex("by_taller", (q) => q.eq("taller", args.taller))
                .take(cupo);
            exigir(
                inscritos.length < cupo,
                "Este taller ya alcanzo su cupo maximo. Gracias por tu interes.",
            );
        }

        return await ctx.db.insert("workshopRegistrations", {
            nombreCompleto,
            email,
            numeroCuenta,
            grupo: args.grupo,
            taller: args.taller,
        });
    },
});
