import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { digitos, esEmail, exigir, limpiar } from "./validaciones";
import { cupoDe } from "../src/app/data/comingSoon";

/**
 * Registra la asistencia de un alumno a un evento.
 *
 * Reemplaza al `supabase.rpc('register_attendee')`. Aquel procedimiento en SQL
 * buscaba o creaba un usuario y luego llenaba `event_registration`; aquí basta
 * una tabla, porque no hay cuentas de usuario que mantener.
 *
 * A diferencia de talleres, este formulario acepta cualquier correo: el evento
 * está abierto a externos.
 */
export const registrar = mutation({
    args: {
        nombreCompleto: v.string(),
        email: v.string(),
        telefono: v.string(),
        grupo: v.string(),
        evento: v.string(),
    },
    returns: v.id("eventRegistrations"),
    handler: async (ctx, args) => {
        const nombreCompleto = limpiar(args.nombreCompleto);
        const email = limpiar(args.email).toLowerCase();
        const telefono = limpiar(args.telefono);

        exigir(nombreCompleto.length >= 3, "El nombre completo debe tener al menos 3 caracteres");
        exigir(esEmail(email), "El correo no es válido");
        exigir(digitos(telefono) >= 10, "El teléfono debe tener al menos 10 dígitos");
        exigir(args.grupo.length > 0, "El grupo es requerido");
        exigir(args.evento.length > 0, "Debes seleccionar un evento");

        // Mismo control de cupo que en talleres. Ver el comentario de
        // `convex/workshops.ts` para el porque de hacerlo dentro de la mutation.
        const cupo = cupoDe(args.evento);
        if (cupo !== null) {
            const inscritos = await ctx.db
                .query("eventRegistrations")
                .withIndex("by_evento", (q) => q.eq("evento", args.evento))
                .take(cupo);
            exigir(
                inscritos.length < cupo,
                "Este evento ya alcanzo su cupo maximo. Gracias por tu interes.",
            );
        }

        return await ctx.db.insert("eventRegistrations", {
            nombreCompleto,
            email,
            telefono,
            grupo: args.grupo,
            evento: args.evento,
        });
    },
});
