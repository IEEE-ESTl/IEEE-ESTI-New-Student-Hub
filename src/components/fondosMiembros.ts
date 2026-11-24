/**
 * Fondo detras de las fotos de miembros, por seccion.
 *
 * Viven en un modulo aparte y no en TarjetaMiembro.tsx a proposito: ese archivo
 * es "use client", y Next.js no le entrega a un componente de servidor (como la
 * pagina de miembros) los valores que exporta un modulo de cliente, sino
 * referencias. El color llegaria como algo que no es un color.
 *
 * ProfileCard decide el estilo del brillo segun lo claro que sea el fondo:
 * sobre uno oscuro el holografico se enciende con color; sobre uno claro se
 * dibuja en gris, mas discreto. Por eso el patron se ve distinto en cada
 * seccion, y es intencional.
 */

/** Blanco para el comite actual. ProfileCard lo degrada solo a gris claro abajo. */
export const FONDO_COMITE = "#ffffff"

/** El azul de la rama para quienes ya pasaron por ella. */
export const FONDO_ICONOS = "#0371a4"
