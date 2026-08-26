/**
 * Correo de aviso a la mesa directiva cuando alguien llena "Únete a la rama".
 *
 * Se llama a la API REST de Resend con `fetch` en lugar de usar su SDK: el
 * runtime de Convex trae `fetch`, así el envío no depende de un paquete extra
 * ni de compatibilidad de runtimes.
 *
 * Remitente y destinatarios se leen de variables de entorno de Convex para que
 * la próxima mesa directiva pueda cambiarlos sin tocar código:
 *
 *   bunx convex env set JOIN_REQUEST_FROM "IEEE ESTl <noreply@ieee-estl.com>"
 *   bunx convex env set JOIN_REQUEST_RECIPIENTS "correo@ejemplo.com,otro@ejemplo.com"
 */

const ROLES_STAFF: Record<string, string> = {
    "web-master": "Web Master",
    tesorero: "Tesorero",
    designer: "Diseñador",
    secretary: "Secretario",
    marketing: "Marketing",
};

export type SolicitudUnion = {
    nombreCompleto: string;
    email: string;
    telefono: string;
    razonUnirse: string;
    tipoParticipacion: "member" | "staff-member";
    rolStaff?: string;
};

/**
 * Escapa el texto que escribió el alumno antes de meterlo en el HTML.
 *
 * Sin esto, alguien puede escribir etiquetas en el campo "razón para unirse" y
 * que se rendericen dentro del correo que lee la mesa directiva. Es el bug que
 * tenía la versión anterior en `/api/send`.
 */
function escapar(texto: string): string {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function construirHtml(solicitud: SolicitudUnion): string {
    const tipo = solicitud.tipoParticipacion === "member" ? "Miembro" : "Miembro del staff";
    const rol = solicitud.rolStaff ? ROLES_STAFF[solicitud.rolStaff] ?? solicitud.rolStaff : null;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0371a4;">Nueva Solicitud de Unión - IEEE Student Branch ESTl</h2>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Información del Solicitante:</h3>
                <p><strong>Nombre completo:</strong> ${escapar(solicitud.nombreCompleto)}</p>
                <p><strong>Email:</strong> ${escapar(solicitud.email)}</p>
                <p><strong>Teléfono:</strong> ${escapar(solicitud.telefono)}</p>
                <p><strong>Tipo de participación:</strong> ${escapar(tipo)}</p>
                ${rol ? `<p><strong>Rol de staff:</strong> ${escapar(rol)}</p>` : ""}
            </div>

            <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0371a4; margin: 20px 0;">
                <h3>Razón para unirse:</h3>
                <p style="line-height: 1.6;">${escapar(solicitud.razonUnirse)}</p>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Este correo fue enviado automáticamente desde el formulario de solicitud de unión.
            </p>
        </div>
    `;
}

/**
 * Envía el aviso. Devuelve `false` sin lanzar si falta configuración, para que
 * la solicitud ya guardada no se pierda por un problema de correo.
 */
export async function enviarAvisoSolicitud(solicitud: SolicitudUnion): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.JOIN_REQUEST_FROM;
    const destinatarios = (process.env.JOIN_REQUEST_RECIPIENTS ?? "")
        .split(",")
        .map((correo) => correo.trim())
        .filter((correo) => correo.length > 0);

    if (!apiKey || !from || destinatarios.length === 0) {
        console.warn(
            "Aviso por correo omitido: falta RESEND_API_KEY, JOIN_REQUEST_FROM o " +
            "JOIN_REQUEST_RECIPIENTS. La solicitud sí quedó guardada. Ver Fase 7 del PLAN.md.",
        );
        return false;
    }

    const respuesta = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: destinatarios,
            subject: "Nueva solicitud de unión a la IEEE Student Branch - ESTl",
            html: construirHtml(solicitud),
        }),
    });

    if (!respuesta.ok) {
        throw new Error(`Resend respondió ${respuesta.status}: ${await respuesta.text()}`);
    }

    return true;
}
