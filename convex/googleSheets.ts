import { action } from "./_generated/server";
import { v } from "convex/values";
import { SignJWT, importPKCS8 } from "jose";

/**
 * Exportacion del panel interno a una hoja de Google Sheets.
 *
 * Como se autentica, en corto: Google no acepta una contrasena, sino un token
 * de acceso de vida corta. Para conseguirlo hay que firmar una credencial
 * (un JWT) con la llave privada de la cuenta de servicio y cambiarla por el
 * token en el endpoint de OAuth. Ese token dura una hora y no se guarda: se
 * pide uno nuevo en cada exportacion, que es lo mas simple y lo mas seguro.
 *
 * Configuracion necesaria en el entorno de Convex:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  el archivo de la cuenta de servicio, en una linea
 *   GOOGLE_SHEETS_ID             el id de la hoja, que sale de su URL
 */

const AMBITO = "https://www.googleapis.com/auth/spreadsheets";
const URL_TOKEN = "https://oauth2.googleapis.com/token";
const URL_SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";

type CuentaDeServicio = {
    client_email: string;
    private_key: string;
};

function leerCredencial(): CuentaDeServicio {
    const crudo = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!crudo) {
        throw new Error(
            "Falta GOOGLE_SERVICE_ACCOUNT_JSON en el entorno de Convex. " +
            "Ver .env.example para el procedimiento.",
        );
    }

    // Se acepta el JSON tal cual o codificado en base64.
    //
    // El base64 existe porque pasar el JSON directo por PowerShell falla: lleva
    // comillas dobles y el shell las mangle antes de que lleguen a la CLI. En
    // base64 solo hay letras, numeros y +/=, que ningun shell malinterpreta.
    const texto = crudo.trimStart().startsWith("{") ? crudo : atob(crudo);

    let cuenta: CuentaDeServicio;
    try {
        cuenta = JSON.parse(texto);
    } catch {
        throw new Error(
            "GOOGLE_SERVICE_ACCOUNT_JSON no se pudo leer. Debe ser el JSON de la " +
            "cuenta de servicio, en una sola linea o codificado en base64. " +
            "Ver .env.example.",
        );
    }

    if (!cuenta.client_email || !cuenta.private_key) {
        throw new Error(
            "La credencial no trae client_email o private_key. Revisa que sea el " +
            "archivo JSON de la cuenta de servicio y no otro.",
        );
    }
    return cuenta;
}

/** Firma un JWT con la llave de la cuenta de servicio y lo cambia por un token. */
async function obtenerToken(cuenta: CuentaDeServicio): Promise<string> {
    // La llave viene del JSON con los saltos de linea escapados como "\n".
    // `importPKCS8` necesita los saltos reales.
    const llave = await importPKCS8(cuenta.private_key.replace(/\\n/g, "\n"), "RS256");

    const ahora = Math.floor(Date.now() / 1000);
    const credencial = await new SignJWT({ scope: AMBITO })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuer(cuenta.client_email)
        .setAudience(URL_TOKEN)
        .setIssuedAt(ahora)
        .setExpirationTime(ahora + 3600)
        .sign(llave);

    const respuesta = await fetch(URL_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: credencial,
        }),
    });

    const cuerpo = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error(
            `Google rechazo la credencial (${respuesta.status}): ` +
            `${cuerpo.error_description ?? cuerpo.error ?? "sin detalle"}`,
        );
    }
    return cuerpo.access_token as string;
}

/**
 * Crea la pestana si no existe.
 *
 * Se hace desde aqui para que quien administra el sitio solo tenga que crear la
 * hoja en blanco y compartirla: las pestanas aparecen solas con el nombre
 * correcto en la primera exportacion.
 */
async function asegurarPestana(token: string, hojaId: string, pestana: string): Promise<void> {
    const respuesta = await fetch(`${URL_SHEETS}/${hojaId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const cuerpo = await respuesta.json();

    if (!respuesta.ok) {
        const detalle = cuerpo.error?.message ?? "sin detalle";
        throw new Error(
            respuesta.status === 403
                ? `Sin permiso para abrir la hoja. Comparte la hoja con la cuenta de ` +
                  `servicio como Editor. Detalle: ${detalle}`
                : `No se pudo abrir la hoja (${respuesta.status}): ${detalle}`,
        );
    }

    const existe = (cuerpo.sheets ?? []).some(
        (h: { properties?: { title?: string } }) => h.properties?.title === pestana,
    );
    if (existe) return;

    await fetch(`${URL_SHEETS}/${hojaId}:batchUpdate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: pestana } } }],
        }),
    });
}

/**
 * Escribe las filas del panel en una pestana de la hoja.
 *
 * Las filas llegan ya formateadas desde el panel, que es lo mismo que se ve en
 * pantalla. Se hace asi para no duplicar la definicion de columnas en dos
 * lugares que se podrian desincronizar.
 *
 * Reemplaza el contenido de la pestana en cada exportacion. No acumula: la hoja
 * refleja el estado actual de la base, no un historico.
 */
export const exportar = action({
    args: {
        pestana: v.string(),
        filas: v.array(v.array(v.string())),
    },
    returns: v.object({ filas: v.number(), url: v.string() }),
    handler: async (ctx, args) => {
        // El panel es interno: sin sesion no se exporta nada. Se verifica aqui
        // ademas del middleware, porque las funciones de Convex son alcanzables
        // por su propia URL.
        const identidad = await ctx.auth.getUserIdentity();
        if (identidad === null) throw new Error("No autorizado");

        const hojaId = process.env.GOOGLE_SHEETS_ID;
        if (!hojaId) {
            throw new Error("Falta GOOGLE_SHEETS_ID en el entorno de Convex.");
        }

        const cuenta = leerCredencial();
        const token = await obtenerToken(cuenta);

        await asegurarPestana(token, hojaId, args.pestana);

        // Se limpia primero para que no queden filas viejas si esta vez hay menos.
        const rango = `${encodeURIComponent(`'${args.pestana}'!A:Z`)}`;
        await fetch(`${URL_SHEETS}/${hojaId}/values/${rango}:clear`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });

        const escritura = await fetch(
            `${URL_SHEETS}/${hojaId}/values/${rango}?valueInputOption=RAW`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ values: args.filas }),
            },
        );

        if (!escritura.ok) {
            const cuerpo = await escritura.json();
            throw new Error(
                `No se pudo escribir en la hoja (${escritura.status}): ` +
                `${cuerpo.error?.message ?? "sin detalle"}`,
            );
        }

        return {
            // Menos el encabezado, que no es un registro.
            filas: Math.max(args.filas.length - 1, 0),
            url: `https://docs.google.com/spreadsheets/d/${hojaId}/edit`,
        };
    },
});
