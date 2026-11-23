import { proximos, slug, type Proximo } from "../src/app/data/comingSoon";
import type { OpcionRegistro } from "../src/app/data/comingSoon";

/**
 * Talleres inventados para las pruebas.
 *
 * Las funciones de Convex leen los talleres y su cupo de `comingSoon.ts`. Si
 * las pruebas usaran los talleres reales, se quedarian sin datos cada vez que
 * un evento termina y la lista de proximos se vacia: paso al archivar WIEEEK.
 *
 * Por eso se agregan estos dos a la lista en memoria. Solo existen mientras
 * corre la prueba: vitest aisla cada archivo de pruebas en su propio proceso,
 * y nada de esto toca los datos del sitio.
 *
 * Funciona porque `proximos` es un arreglo compartido: las funciones de Convex
 * y las pruebas importan el mismo modulo y ven el mismo arreglo.
 */
const TALLERES: Proximo[] = [
    {
        id: 9001,
        title: "Taller de Prueba Uno",
        description: "",
        fullDescription: "",
        fecha: "2099-01-01",
        location: "Laboratorio de pruebas",
        category: "Taller",
        instructor: "Nadie",
        image: "",
        registroAbierto: true,
        cupoMaximo: 25,
    },
    {
        id: 9002,
        title: "Taller de Prueba Dos",
        description: "",
        fullDescription: "",
        fecha: "2099-01-02",
        location: "Laboratorio de pruebas",
        category: "Taller",
        instructor: "Nadie",
        image: "",
        registroAbierto: true,
        cupoMaximo: 25,
    },
];

/** Agrega los talleres de prueba (una sola vez) y devuelve sus identificadores. */
export function usarTalleresDePrueba(): [OpcionRegistro, OpcionRegistro] {
    for (const taller of TALLERES) {
        if (!proximos.some((p) => p.id === taller.id)) proximos.push(taller);
    }
    const [uno, dos] = TALLERES.map((t) => ({ valor: slug(t.title), etiqueta: t.title }));
    return [uno, dos];
}
