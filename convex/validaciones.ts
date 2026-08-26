/**
 * Helpers de validación compartidos por las funciones de Convex.
 *
 * Este archivo NO exporta funciones de Convex: es un módulo de utilidades
 * normal que importan las mutations y actions.
 *
 * Por qué validar aquí si los formularios ya validan en el navegador: las
 * funciones públicas de Convex están expuestas a internet. Cualquiera puede
 * llamarlas desde la consola del navegador saltándose la UI por completo. La
 * validación del cliente es para la experiencia de uso; esta es la que protege
 * los datos.
 */

/** Recorta espacios y colapsa los repetidos. */
export function limpiar(texto: string): string {
    return texto.trim().replace(/\s+/g, " ");
}

/**
 * Normaliza para comparar: minúsculas, sin acentos, sin espacios repetidos.
 * Se usa para la clave de deduplicación de "Queremos Conocerte".
 */
export function normalizar(texto: string): string {
    return limpiar(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

export function esEmail(valor: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

/** El registro a talleres exige correo institucional de la UAEH. */
export function esEmailUaeh(valor: string): boolean {
    return /^[^\s@]+@uaeh\.edu\.mx$/.test(valor);
}

/** Cuenta solo los dígitos, ignorando espacios, guiones y paréntesis. */
export function digitos(valor: string): number {
    return valor.replace(/[^0-9]/g, "").length;
}

/**
 * Lanza un error si la condición no se cumple.
 * El mensaje llega al cliente, así que debe ser legible para el alumno.
 */
export function exigir(condicion: boolean, mensaje: string): void {
    if (!condicion) {
        throw new Error(mensaje);
    }
}
