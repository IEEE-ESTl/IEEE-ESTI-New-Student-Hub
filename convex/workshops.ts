import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { digitos, esEmailUaeh, exigir, limpiar } from "./validaciones";
import { cupoDe } from "../src/app/data/comingSoon";

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
        telefono: v.string(),
        grupo: v.string(),
        taller: v.string(),
    },
    returns: v.id("workshopRegistrations"),
    handler: async (ctx, args) => {
        const nombreCompleto = limpiar(args.nombreCompleto);
        const email = limpiar(args.email).toLowerCase();
        const telefono = limpiar(args.telefono);

        exigir(nombreCompleto.length >= 3, "El nombre completo debe tener al menos 3 caracteres");
        exigir(esEmailUaeh(email), "El correo debe ser institucional de la UAEH (@uaeh.edu.mx)");
        exigir(digitos(telefono) >= 8, "El teléfono debe tener al menos 8 dígitos");
        exigir(args.grupo.length > 0, "El grupo es requerido");
        exigir(args.taller.length > 0, "El taller es requerido");

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
            telefono,
            grupo: args.grupo,
            taller: args.taller,
        });
    },
});
