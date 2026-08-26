import type { Evento } from "./events"

// Próximos eventos. Se muestran en /coming-soon, y además el home renderiza la
// sección solo si esta lista tiene algo (ver `hayProximosEventos`).
//
// Para anunciar un evento: agrega un objeto aquí y aparece en ambos lugares.
// Al terminar, muévelo a `events.ts` para que quede en el historial.

export type Proximo = Evento & {
    /** Enlace opcional de registro. Si se omite, la tarjeta no muestra botón. */
    registerLink?: string
}

export const proximos: Proximo[] = []

/**
 * Lo usa el home para decidir si monta la sección de próximos eventos.
 * Mientras la lista esté vacía, la sección simplemente no aparece en la landing.
 */
export const hayProximosEventos = proximos.length > 0
