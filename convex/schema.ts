import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex agrega `_id` y `_creationTime` a todos los documentos, así que ninguna
// tabla necesita su propio campo de fecha.

export default defineSchema({
    // Formulario "Únete a la rama" (JoinDialog).
    joinRequests: defineTable({
        nombreCompleto: v.string(),
        email: v.string(),
        telefono: v.string(),
        razonUnirse: v.string(),
        tipoParticipacion: v.union(v.literal("member"), v.literal("staff-member")),
        // Solo se llena cuando tipoParticipacion es "staff-member".
        rolStaff: v.optional(
            v.union(
                v.literal("web-master"),
                v.literal("tesorero"),
                v.literal("designer"),
                v.literal("secretary"),
                v.literal("marketing"),
            ),
        ),
    }),

    // Registro a talleres (/register-workshop).
    workshopRegistrations: defineTable({
        nombreCompleto: v.string(),
        email: v.string(),
        telefono: v.string(),
        grupo: v.string(),
        taller: v.string(),
    }),

    // Registro a eventos (/register-event).
    eventRegistrations: defineTable({
        nombreCompleto: v.string(),
        email: v.string(),
        telefono: v.string(),
        grupo: v.string(),
        evento: v.string(),
    }),

    // Sección "Queremos Conocerte" (Fase 4).
    studentInterests: defineTable({
        nombreCompleto: v.string(),
        grupoSemestre: v.string(),

        interesesTecnologicos: v.array(
            v.union(
                v.literal("inteligencia-artificial"),
                v.literal("videojuegos"),
                v.literal("ciberseguridad"),
                v.literal("desarrollo-movil"),
                v.literal("desarrollo-web"),
                v.literal("diseno-ui-ux"),
                v.literal("backend"),
                v.literal("analisis-de-datos"),
                v.literal("bases-de-datos"),
            ),
        ),

        nivelExperiencia: v.union(
            v.literal("empezando"),
            v.literal("intermedio"),
            v.literal("avanzado"),
        ),

        formatoEventos: v.array(
            v.union(
                v.literal("talleres-practicos"),
                v.literal("charlas-de-expertos"),
                v.literal("networking"),
                v.literal("hackathons"),
            ),
        ),

        industriaCuriosidad: v.array(
            v.union(
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
            ),
        ),

        metaSemestre: v.string(),

        // Clave de deduplicación: `nombreCompleto` + `grupoSemestre` normalizados
        // (minúsculas, sin acentos, espacios colapsados). La mutation de la Fase 4
        // la consulta por índice para rechazar respuestas repetidas.
        claveDedup: v.string(),
    }).index("by_claveDedup", ["claveDedup"]),
});
