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
}

export const proximos: Proximo[] = []

/**
 * Lo usa el home para decidir si monta la seccion de proximos eventos.
 * Mientras la lista este vacia, la seccion simplemente no aparece en la landing.
 */
export const hayProximosEventos = proximos.length > 0

export type OpcionRegistro = { valor: string; etiqueta: string }

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
        .filter((evento) => evento.registroAbierto)
        .filter((evento) =>
            categoria
                ? evento.category.toLowerCase() === categoria.toLowerCase()
                : evento.category.toLowerCase() !== "taller",
        )
        .map((evento) => ({ valor: slug(evento.title), etiqueta: evento.title }))
}
