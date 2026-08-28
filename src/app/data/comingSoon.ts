import type { Evento } from "./events"

// Proximos eventos. Esta lista es la UNICA fuente de verdad sobre lo que viene:
// de aqui salen el anuncio en el home, la pagina /coming-soon y las opciones de
// los formularios de registro.
//
// Ciclo de vida de un evento, dos ediciones y ambas en este archivo:
//
//   1. ANUNCIAR - agrega el objeto a `proximos`. Aparece en el home, en
//      /coming-soon y, si `registroAbierto` es true, como opcion en el
//      formulario de registro que le corresponda.
//   2. CERRAR - cuando el evento termine, muevelo a `events.ts`. Sale del
//      formulario, el registro se cierra solo y queda en el historial.
//
// No hay que tocar JSX para ninguna de las dos cosas.

export type Proximo = Evento & {
    /** Enlace opcional de registro. Si se omite, la tarjeta no muestra boton. */
    registerLink?: string
    /**
     * Si es true, el evento aparece como opcion en el formulario de registro.
     * Sirve para anunciar algo antes de abrir las inscripciones.
     */
    registroAbierto?: boolean
    /**
     * Ultimo dia para inscribirse, en formato "AAAA-MM-DD" (por ejemplo
     * "2027-01-10"). El dia indicado SI cuenta: cierra al terminar esa fecha.
     *
     * Va en un formato distinto al de `date` a proposito. `date` es texto para
     * mostrarle a la gente ("15 de enero de 2027") y ninguna computadora puede
     * compararlo sin adivinar; este campo es para que el sistema decida, asi que
     * necesita un formato que se pueda comparar sin ambiguedad.
     *
     * Si se omite, el registro sigue abierto hasta que alguien ponga
     * `registroAbierto: false` a mano.
     */
    fechaLimiteRegistro?: string
}

export const proximos: Proximo[] = [
]

/**
 * Lo usa el home para decidir si monta la seccion de proximos eventos.
 * Mientras la lista este vacia, la seccion simplemente no aparece en la landing.
 */
export const hayProximosEventos = proximos.length > 0

export type OpcionRegistro = { valor: string; etiqueta: string }

/**
 * Fecha de hoy en Hidalgo (UTC-6), como "AAAA-MM-DD".
 *
 * Se calcula con un desplazamiento fijo en lugar de usar la zona horaria del
 * equipo a proposito: asi el servidor y el navegador llegan al mismo resultado
 * aunque esten configurados en zonas distintas. Mexico no cambia de horario
 * desde 2022, asi que el -6 es estable.
 */
function hoyEnHidalgo(): string {
    const DESFASE_HORAS = -6
    return new Date(Date.now() + DESFASE_HORAS * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
}

/**
 * Si un evento acepta inscripciones ahora mismo.
 *
 * Son dos condiciones: que alguien lo haya abierto, y que el plazo no haya
 * vencido. La comparacion de textos "AAAA-MM-DD" funciona porque ese formato
 * ordena igual como fecha que como cadena.
 */
export function registroVigente(evento: Proximo): boolean {
    if (!evento.registroAbierto) return false
    if (!evento.fechaLimiteRegistro) return true
    return hoyEnHidalgo() <= evento.fechaLimiteRegistro
}

/**
 * A que formulario mandar a quien quiere inscribirse a este evento.
 * Los talleres son solo para alumnos de la ESTl; el resto acepta externos.
 */
export function rutaDeRegistro(evento: Proximo): string {
    return evento.category.toLowerCase() === "taller"
        ? "/register-workshop"
        : "/register-event"
}

/**
 * Convierte el titulo en un identificador estable para guardar en Convex.
 * "Hackathon Frontend" -> "hackathon-frontend"
 *
 * Se deriva del titulo en vez de escribirse a mano para que no puedan
 * desincronizarse, y produce valores legibles en el dashboard.
 */
export function slug(titulo: string): string {
    return titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

/**
 * Opciones con inscripcion abierta, filtradas por categoria.
 *
 * @param categoria "Taller" para /register-workshop. Si se omite, devuelve todo
 *                  lo que NO es taller, que es lo que muestra /register-event.
 */
export function opcionesDeRegistro(categoria?: string): OpcionRegistro[] {
    return proximos
        .filter(registroVigente)
        .filter((evento) =>
            categoria
                ? evento.category.toLowerCase() === categoria.toLowerCase()
                : evento.category.toLowerCase() !== "taller",
        )
        .map((evento) => ({ valor: slug(evento.title), etiqueta: evento.title }))
}

