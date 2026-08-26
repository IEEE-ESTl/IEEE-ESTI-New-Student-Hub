import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { exigir, limpiar, normalizar } from "./validaciones";

const intereses = v.union(
    v.literal("inteligencia-artificial"),
    v.literal("videojuegos"),
    v.literal("ciberseguridad"),
    v.literal("desarrollo-movil"),
    v.literal("desarrollo-web"),
    v.literal("diseno-ui-ux"),
    v.literal("backend"),
    v.literal("analisis-de-datos"),
    v.literal("bases-de-datos"),
);

const formatos = v.union(
    v.literal("talleres-practicos"),
    v.literal("charlas-de-expertos"),
    v.literal("networking"),
    v.literal("hackathons"),
);

const industrias = v.union(
    v.literal("gaming"),
    v.literal("enterprise-software"),
    v.literal("media-streaming"),
    v.literal("hardware-iot"),
    v.literal("fintech"),
    v.literal("cloud"),
    v.literal("open-source"),
    v.literal("e-commerce"),
    v.literal("tecnologias-comunitarias"),
    v.literal("data-science-ai"),
);

/**
 * Guarda una respuesta de "Queremos Conocerte".
 *
 * Sobre los duplicados: el formulario es anónimo en cuanto a contacto, pero sí
 * pide nombre y grupo. Con eso se arma `claveDedup` —ambos normalizados a
 * minúsculas y sin acentos— y se consulta por índice antes de insertar.
 *
 * Es la barrera que cuenta. La marca en `localStorage` del componente evita el
 * reenvío accidental, pero se sortea cambiando de navegador; esta no.
 *
 * Límite conocido: dos alumnos homónimos del mismo grupo se bloquean entre sí.
 * Sin identidad verificada no hay forma de distinguirlos, y para el propósito
 * —detectar tendencias para planear talleres— el intercambio vale la pena.
 */
export const responder = mutation({
    args: {
        nombreCompleto: v.string(),
        grupoSemestre: v.string(),
        interesesTecnologicos: v.array(intereses),
        nivelExperiencia: v.union(
            v.literal("empezando"),
            v.literal("intermedio"),
            v.literal("avanzado"),
        ),
        formatoEventos: v.array(formatos),
        industriaCuriosidad: v.array(industrias),
        metaSemestre: v.string(),
    },
    returns: v.id("studentInterests"),
    handler: async (ctx, args) => {
        const nombreCompleto = limpiar(args.nombreCompleto);
        const grupoSemestre = limpiar(args.grupoSemestre);
        const metaSemestre = args.metaSemestre.trim();

        exigir(nombreCompleto.length >= 3, "El nombre completo debe tener al menos 3 caracteres");
        exigir(grupoSemestre.length > 0, "El grupo o semestre es requerido");
        exigir(args.interesesTecnologicos.length > 0, "Elige al menos un área de interés");
        exigir(args.formatoEventos.length > 0, "Elige al menos un formato de evento");
        exigir(args.industriaCuriosidad.length > 0, "Elige al menos una industria");
        exigir(metaSemestre.length >= 5, "Cuéntanos un poco más sobre lo que quieres aprender");
        exigir(metaSemestre.length <= 500, "La respuesta no puede exceder 500 caracteres");

        const claveDedup = `${normalizar(nombreCompleto)}|${normalizar(grupoSemestre)}`;

        const yaRespondio = await ctx.db
            .query("studentInterests")
            .withIndex("by_claveDedup", (q) => q.eq("claveDedup", claveDedup))
            .unique();

        exigir(
            yaRespondio === null,
            "Ya tenemos registrada una respuesta con ese nombre y grupo. ¡Gracias por participar!",
        );

        return await ctx.db.insert("studentInterests", {
            nombreCompleto,
            grupoSemestre,
            interesesTecnologicos: args.interesesTecnologicos,
            nivelExperiencia: args.nivelExperiencia,
            formatoEventos: args.formatoEventos,
            industriaCuriosidad: args.industriaCuriosidad,
            metaSemestre,
            claveDedup,
        });
    },
});
