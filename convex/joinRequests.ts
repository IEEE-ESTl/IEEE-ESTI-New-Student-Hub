import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { digitos, esEmail, exigir, limpiar } from "./validaciones";
import { enviarAvisoSolicitud } from "./emails/joinRequest";
import type { Id } from "./_generated/dataModel";

const argumentos = {
    nombreCompleto: v.string(),
    email: v.string(),
    telefono: v.string(),
    razonUnirse: v.string(),
    tipoParticipacion: v.union(v.literal("member"), v.literal("staff-member")),
    rolStaff: v.optional(
        v.union(
            v.literal("web-master"),
            v.literal("tesorero"),
            v.literal("designer"),
            v.literal("secretary"),
            v.literal("marketing"),
        ),
    ),
};

/**
 * Guarda la solicitud. Es `internalMutation`, no `mutation`: no está expuesta a
 * internet, solo la puede llamar la action de abajo.
 */
export const guardar = internalMutation({
    args: argumentos,
    returns: v.id("joinRequests"),
    handler: async (ctx, args) => {
        const nombreCompleto = limpiar(args.nombreCompleto);
        const email = limpiar(args.email).toLowerCase();
        const telefono = limpiar(args.telefono);
        const razonUnirse = args.razonUnirse.trim();

        exigir(nombreCompleto.length >= 2, "El nombre completo debe tener al menos 2 caracteres");
        exigir(nombreCompleto.length <= 100, "El nombre completo no puede exceder 100 caracteres");
        exigir(esEmail(email), "El correo no es válido");
        exigir(digitos(telefono) >= 10, "El teléfono debe tener al menos 10 dígitos");
        exigir(razonUnirse.length >= 10, "Explica en al menos 10 caracteres por qué quieres unirte");
        exigir(razonUnirse.length <= 500, "La descripción no puede exceder 500 caracteres");
        exigir(
            args.tipoParticipacion !== "staff-member" || args.rolStaff !== undefined,
            "Selecciona un rol de staff",
        );

        return await ctx.db.insert("joinRequests", {
            nombreCompleto,
            email,
            telefono,
            razonUnirse,
            tipoParticipacion: args.tipoParticipacion,
            rolStaff: args.rolStaff,
        });
    },
});

/**
 * Punto de entrada del formulario "Únete a la rama".
 *
 * Es una `action` y no una `mutation` porque tiene que hacer dos cosas: escribir
 * en la base y llamar a un servicio externo (Resend). Las mutations no pueden
 * llamar servicios externos; las actions sí, pero no tocan la base directamente,
 * por eso delega el insert en `guardar`.
 *
 * El orden importa: primero se guarda, después se intenta el correo. Si el envío
 * falla, la solicitud ya quedó registrada y se ve en el dashboard. En la versión
 * anterior, un fallo de Resend perdía la solicitud por completo.
 */
export const enviar = action({
    args: argumentos,
    returns: v.object({
        id: v.id("joinRequests"),
        correoEnviado: v.boolean(),
    }),
    handler: async (ctx, args) => {
        const id: Id<"joinRequests"> = await ctx.runMutation(internal.joinRequests.guardar, args);

        let correoEnviado = false;
        try {
            correoEnviado = await enviarAvisoSolicitud(args);
        } catch (error) {
            console.error("Falló el envío del aviso por correo:", error);
        }

        return { id, correoEnviado };
    },
});
