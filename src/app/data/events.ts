// Eventos ya realizados por la rama. Se muestran en /events.
//
// Los datos viven aquí, fuera del componente, para que agregar un evento sea
// editar una lista y no tocar JSX. Es también lo que permite que el home
// decida si mostrar la seccion de proximos eventos: ver `comingSoon.ts`.

/**
 * Categorias permitidas para un evento.
 *
 * Es una lista cerrada a proposito. Antes `category` era texto libre, y un error
 * de dedo no daba error: simplemente mandaba el evento al formulario equivocado
 * sin avisar. Con esta lista, TypeScript marca el problema al escribirlo.
 *
 * La categoria decide a que formulario va la inscripcion:
 *   "Taller"  -> /register-workshop  (solo alumnos, exige correo @uaeh.edu.mx)
 *   las demas -> /register-event     (acepta externos)
 *
 * Para agregar una categoria nueva, anadela aqui y dale un color en
 * `getCategoryColor` de Events.tsx y ComingSoon.tsx.
 */
export const CATEGORIAS = [
  "Taller",
  "Curso",
  "Hackathon",
  "Congreso",
  "Conferencia",
  "Evento",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

/**
 * Color de la etiqueta de cada categoria.
 *
 * Vive aqui, junto a `CATEGORIAS`, para que agregar una categoria siga siendo
 * editar un solo archivo. Antes cada componente tenia su propia lista y se
 * desincronizaron: un congreso se veia rojo en /events y gris en /coming-soon.
 *
 * Al ser un `Record<Categoria, string>`, TypeScript exige que TODAS las
 * categorias tengan color. Si agregas una a la lista y olvidas el color, el
 * proyecto no compila.
 */
export const COLOR_CATEGORIA: Record<Categoria, string> = {
  Taller: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  Curso: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  Hackathon: "bg-green-100 text-green-800 hover:bg-green-200",
  Congreso: "bg-red-100 text-red-800 hover:bg-red-200",
  Conferencia: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  Evento: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
};

/**
 * Una fecha escrita como "AAAA-MM-DD".
 *
 * El tipo atrapa al compilar el error mas comun, que es escribir la fecha en
 * texto ("3 de marzo de 2027"). Lo que no puede atrapar —un mes 13, un dia sin
 * ceros— lo avisa `revisarFechas()` en la consola de desarrollo.
 */
export type FechaISO = `${number}-${number}-${number}`;

export type Evento = {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  /**
   * Dia en que ocurre, o en que empieza si dura varios.
   *
   * Antes era texto libre ("16 de febrero de 2024"), que se leia bien pero no
   * se podia ordenar ni agrupar por año. Ahora se guarda la fecha y el texto
   * se genera con `fechaLegible()`: una sola fuente, sin que la fecha escrita y
   * la real puedan contradecirse.
   */
  fecha: FechaISO;
  /** Solo si dura mas de un dia: el ultimo dia. */
  fechaFin?: FechaISO;
  location: string;
  category: Categoria;
  instructor: string;
  image: string;
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2024-02-16" -> { dia: 16, mes: "febrero", anio: 2024 } */
function partes(iso: string) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return { dia, mes: MESES[mes - 1], anio };
}

/**
 * La fecha de un evento, lista para leer.
 *
 *   "2024-02-16"                  -> "16 de febrero de 2024"
 *   "2026-10-26" a "2026-10-28"   -> "26 al 28 de octubre de 2026"
 *   "2026-09-30" a "2026-10-02"   -> "30 de septiembre al 2 de octubre de 2026"
 *   "2026-12-30" a "2027-01-02"   -> "30 de diciembre de 2026 al 2 de enero de 2027"
 *
 * Los meses van escritos a mano en vez de usar `toLocaleDateString` a
 * proposito: ese depende de la zona horaria de quien lo ejecuta. El servidor
 * en Cloudflare corre en UTC y el navegador en hora de Mexico, asi que una
 * misma fecha podia salir con un dia de diferencia en cada uno.
 */
export function fechaLegible(evento: { fecha: string; fechaFin?: string }): string {
  const ini = partes(evento.fecha);
  if (!evento.fechaFin || evento.fechaFin === evento.fecha) {
    return `${ini.dia} de ${ini.mes} de ${ini.anio}`;
  }

  const fin = partes(evento.fechaFin);
  if (ini.anio !== fin.anio) {
    return `${ini.dia} de ${ini.mes} de ${ini.anio} al ${fin.dia} de ${fin.mes} de ${fin.anio}`;
  }
  if (ini.mes !== fin.mes) {
    return `${ini.dia} de ${ini.mes} al ${fin.dia} de ${fin.mes} de ${fin.anio}`;
  }
  return `${ini.dia} al ${fin.dia} de ${fin.mes} de ${fin.anio}`;
}

/**
 * La fecha en corto, sin año, para las tarjetas del historial.
 *
 *   "2024-02-16"                  -> "16 feb"
 *   "2026-10-26" a "2026-10-28"   -> "26–28 oct"
 *   "2026-09-30" a "2026-10-02"   -> "30 sep – 2 oct"
 *
 * Va sin año porque las tarjetas ya estan agrupadas bajo el suyo; repetirlo en
 * cada una solo agrega ruido. El texto completo sigue en el detalle.
 */
export function fechaCorta(evento: { fecha: string; fechaFin?: string }): string {
  const corto = (mes: string) => mes.slice(0, 3);
  const ini = partes(evento.fecha);
  if (!evento.fechaFin || evento.fechaFin === evento.fecha) {
    return `${ini.dia} ${corto(ini.mes)}`;
  }

  const fin = partes(evento.fechaFin);
  if (ini.mes === fin.mes && ini.anio === fin.anio) {
    return `${ini.dia}–${fin.dia} ${corto(fin.mes)}`;
  }
  return `${ini.dia} ${corto(ini.mes)} – ${fin.dia} ${corto(fin.mes)}`;
}

/** Año en que empieza un evento. Decide en que bloque del historial aparece. */
export function anioDe(evento: { fecha: string }): string {
  return evento.fecha.slice(0, 4);
}

export type BloqueAnio = { anio: string; eventos: Evento[] };

/**
 * El historial ordenado del mas nuevo al mas viejo y agrupado por año.
 *
 * En un empate de fecha se respeta el orden en que estan escritos en la lista.
 * Asi, cuando un evento trae varios talleres el mismo dia, el evento principal
 * —que se escribe primero— sale antes que sus talleres.
 *
 * Si se pasa una categoria, solo entran los de esa categoria, y los años que
 * se quedan sin eventos desaparecen en lugar de mostrarse vacios.
 */
export function historialPorAnio(lista: Evento[], categoria?: Categoria): BloqueAnio[] {
  const ordenados = lista
    .map((evento, posicion) => ({ evento, posicion }))
    .filter(({ evento }) => !categoria || evento.category === categoria)
    .sort((a, b) => b.evento.fecha.localeCompare(a.evento.fecha) || a.posicion - b.posicion)
    .map(({ evento }) => evento);

  const bloques: BloqueAnio[] = [];
  for (const evento of ordenados) {
    const anio = anioDe(evento);
    const ultimo = bloques[bloques.length - 1];
    if (ultimo?.anio === anio) ultimo.eventos.push(evento);
    else bloques.push({ anio, eventos: [evento] });
  }
  return bloques;
}

/**
 * Cuantos eventos hay de cada categoria, solo de las que tienen alguno.
 *
 * Las categorias vacias no se incluyen a proposito: un filtro que no devuelve
 * nada es un boton que no sirve. Cuando se archive la primera Conferencia,
 * su filtro aparece solo.
 */
export function conteoPorCategoria(lista: Evento[]): { categoria: Categoria; total: number }[] {
  return CATEGORIAS.map((categoria) => ({
    categoria,
    total: lista.filter((e) => e.category === categoria).length,
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * Lee la categoria del enlace: `/events?categoria=taller` -> "Taller".
 *
 * No distingue mayusculas, para que un enlace escrito a mano funcione. Si el
 * valor no es una categoria —un enlace viejo, una errata— devuelve `undefined`
 * y la pagina muestra todo en lugar de una lista vacia.
 */
export function categoriaDesdeParametro(valor: string | undefined): Categoria | undefined {
  if (!valor) return undefined;
  return CATEGORIAS.find((c) => c.toLowerCase() === valor.toLowerCase());
}

export const eventos: Evento[] = [
  {
    id: 1,
    title: "Taller de Git y Github",
    description: "Taller donde se aprendieron los fundamentos de Git y Github",
    fullDescription:
      "En este taller se aprendieron los fundamentos de Git y Github, una herramienta de control de versiones de código abierto, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones.",
    fecha: "2024-02-16",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Johan González",
    image: "/talleres/tallerGit.webp",
  },
  {
    id: 2,
    title: "Frontend Hackathon",
    description:
      "Hackathon donde se desarrolló una aplicación web de recetario",
    fullDescription:
      "En este hackathon se desarrolló una aplicación web de recetario utilizando el framework de tu preferencia, fue una gran oportunidad para que los estudiantes pusieran a prueba sus habilidades de desarrollo web.",
    fecha: "2024-02-24",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Hackathon",
    instructor: "Erick Medel",
    image: "/eventos/hackathon-frontend.jpeg",
  },
  {
    id: 3,
    title: "Taller de PostgreSQL",
    description: "Taller donde se aprendieron los fundamentos de PostgreSQL",
    fullDescription:
      "En este taller se aprendieron los fundamentos de PostgreSQL, una base de datos relacional de código abierto, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias bases de datos.",
    fecha: "2024-03-12",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Ángel Enrique Romero Cuevas",
    image: "/talleres/tallerSql.webp",
  },
  {
    id: 4,
    title: "Cinsoft 2024",
    description:
      "Congreso de Software donde hubieron talleres, conferencias y mucho más",
    fullDescription:
      "En este congreso se realizaron talleres, conferencias y mucho más, fue una gran oportunidad para que los estudiantes aprendieran sobre el mundo del software y la tecnología. El evento fue organizado por la IEEE - Escuela Superior de Tlahuelilpan Student Branch con apoyo de la Licenciatura en Ingeniería de Software.",
    fecha: "2024-10-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Congreso",
    instructor: "IEEE - Escuela Superior de Tlahuelilpan Student Branch",
    image: "/eventos/cinsoft.webp",
  },
  {
    id: 5,
    title: "Taller de Azure",
    description: "Taller donde se aprendieron los fundamentos de Azure",
    fullDescription:
      "En este taller se aprendieron los fundamentos de Azure, una plataforma de cloud computing de Microsoft, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones en la nube.",
    fecha: "2024-10-29",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Brujería Tech",
    image: "/talleres/tallerAzure.jpg",
  },
  {
    id: 6,
    title: "Taller de AWS",
    description: "Taller donde se aprendieron los fundamentos de AWS",
    fullDescription:
      "En este taller se aprendieron los fundamentos de AWS, una plataforma de cloud computing de Amazon, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones en la nube. Se desarrolló una aplicación CRUD usando Node.js y Express.",
    fecha: "2024-10-29",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Ing. Hugo Alejandres",
    image: "/talleres/tallerAws.jpg",
  },
  {
    id: 7,
    title: "Welcome Back",
    description:
      "Un evento lleno de sorpresas, oportunidades y mucha actitud para dar inicio a un nuevo semestre.",
    fullDescription:
      "Durante este evento, los asistentes pudieron reencontrarse con sus amigos, conocer nuevos compañeros y comenzar el semestre con mucha energía y entusiasmo.",
    fecha: "2025-08-14",
    location: "Auditorio de la ESTl",
    category: "Evento",
    instructor: "IEEE ESTl Student Branch",
    image: "/eventos/welcomeback.jpeg",
  },
  {
    id: 8,
    title: "Taller de React y Tailwind",
    description:
      "Taller en el que se aprendieron los fundamentos de React y Tailwind para desarrollar aplicaciones web modernas y responsivas.",
    fullDescription:
      "Durante este taller, los participantes aprendieron los fundamentos de React y Tailwind para desarrollar aplicaciones web modernas y responsivas. Además, conocieron cómo crear componentes reutilizables, manejar el estado de una aplicación y diseñar interfaces de usuario atractivas y funcionales.",
    fecha: "2025-09-26",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Paulo Mantilla",
    image: "/talleres/tallerReact.webp",
  },
  {
    id: 9,
    title: "Primeros pasos: Impresión 3D",
    description:
      "Taller en el que se aprendieron los fundamentos de la impresión 3D y su aplicación en la creación de proyectos propios.",
    fullDescription:
      "Durante este taller, los participantes conocieron los fundamentos de la impresión 3D y aprendieron a utilizarlos en el desarrollo de sus propios proyectos. Se abordó la creación de modelos 3D, el proceso de impresión y las posibilidades de esta tecnología para materializar diferentes ideas.",
    fecha: "2025-09-26",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Mario Lozano",
    image: "/talleres/taller3D.webp",
  },
  {
    id: 10,
    title: "Hackathon Frontend",
    description:
      "Hackathon de frontend en el que los participantes demostraron sus habilidades creando interfaces de usuario para una plataforma web de películas.",
    fullDescription:
      "Durante este hackathon, los participantes pusieron en práctica sus conocimientos de desarrollo frontend y exploraron diferentes tecnologías para crear soluciones creativas. El reto consistió en diseñar una interfaz para una plataforma web de películas que fuera atractiva, intuitiva y funcional.",
    fecha: "2025-11-28",
    fechaFin: "2025-12-05",
    location: "Online",
    category: "Hackathon",
    instructor: "Equipo IEEE ESTl",
    image: "/eventos/hackathon-frontend-2025.webp",
  },
  {
    id: 11,
    title: "Cómo ser una verdadera swiftie: Primeros pasos en SwiftUI",
    description:
      "Taller en el que se aprendieron los fundamentos de SwiftUI para desarrollar aplicaciones iOS modernas y responsivas.",
    fullDescription:
      "Durante este taller, los participantes aprendieron los fundamentos de SwiftUI mediante una práctica guiada donde se creo una aplicación iOS funcional.",
    fecha: "2025-11-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Paulo Mantilla",
    image: "/talleres/tallerSwiftUI.webp",
  },
  {
    id: 12,
    title: "Wieeek 2026 - Primera Edición: Desarrollo de Videojuegos",
    description:
      "Primera edición de la WIEEEK: tres días de talleres presenciales dedicados al desarrollo de videojuegos con Roblox, Unity y Blender.",
    fullDescription:
      "Durante tres días se llevó a cabo la primera edición de la WIEEEK, un evento presencial enfocado en el desarrollo de videojuegos. Se impartieron cuatro talleres en paralelo (Roblox, Unity, Blender y AWS) y se realizó un torneo de E-Sports. ",
    fecha: "2026-10-26",
    fechaFin: "2026-10-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Evento",
    instructor: "IEEE - Escuela Superior de Tlahuelilpan Student Branch",
    image: "/eventos/wieeek-2026.webp",
  },
  {
    id: 13,
    title: "Torneo E-Sports",
    description:
      "Torneo presencial de E-Sports en el que los participantes compitieron en Minecraft, Clash Royale y FC27 durante los tres días de la WIEEEK.",
    fullDescription:
      "Durante los tres días del evento, los participantes se enfrentaron en tres videojuegos: Minecraft, Clash Royale y FC27. Las partidas sumaron puntos a una tabla general, y se premió a los tres primeros lugares con mayor puntaje.",
    fecha: "2026-10-26",
    fechaFin: "2026-10-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Evento",
    instructor: "IEEE - Escuela Superior de Tlahuelilpan Student Branch",
    image: "/eventos/e-sport-ganadores.webp",
  },
  {
    id: 14,
    title: "Despliega tu Servidor de Minecraft en AWS EC2",
    description:
      "Taller práctico de 4 horas en el que se desplegó y administró un servidor multijugador de Minecraft en Amazon EC2.",
    fullDescription:
      "Este taller fue organizado por el AWS Student Builder Group UAEH e impartido por Rodrigo Roldán. Durante la sesión, los participantes aprendieron a aprovisionar, asegurar y automatizar la infraestructura completa de un servidor de Minecraft Java Edition utilizando la nube de Amazon Web Services (AWS).",
    fecha: "2026-10-26",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "AWS Student Builder Group - UAEH",
    image: "/talleres/tallerCORE.webp",
  },
  {
    id: 15,
    title: "Desarrollo de Videojuegos en Roblox",
    description:
      "Taller presencial de 9 horas enfocado en la creación y publicación de un nivel jugable en Roblox.",
    fullDescription:
      "Impartido por el Dr. Ismael Domínguez, este taller se desarrolló en sesiones de 3 horas durante los tres días del evento. Los participantes trabajaron en la creación de un nivel jugable, con el objetivo de publicarlo en Roblox como entregable final.",
    fecha: "2026-10-26",
    fechaFin: "2026-10-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Dr. Ismael Domínguez",
    image: "/talleres/tallerRoblox2.webp",
  },
  {
    id: 16,
    title: "Desarrollo en Unity",
    description:
      "Taller presencial en el que se desarrolló una escena con un personaje animado y controlable en Unity.",
    fullDescription:
      "Impartido por el Lic. Moisés Valenzuela en el Laboratorio 2, este taller se llevó a cabo durante los tres días del evento. Los participantes aprendieron a construir una escena en Unity con un personaje animado y controlable, que fue el entregable final del taller.",
    fecha: "2026-10-26",
    fechaFin: "2026-10-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Lic. Moisés Valenzuela",
    image: "/talleres/tallerUnity2.webp",
  },
  {
    id: 17,
    title: "Creación de assets en Blender",
    description:
      "Taller de 9 horas dedicado al modelado 3D y a la creación de assets listos para usarse en un motor de videojuegos.",
    fullDescription:
      "Impartido por la Dra. Julia Arana en el Laboratorio 3, este taller se llevó a cabo en sesiones de 3 horas durante los tres días del evento. Los participantes aprendieron a diseñar elementos 3D con el objetivo de entregar un set de modelos exportados y listos para usarse en un motor gráfico.",
    fecha: "2026-10-26",
    fechaFin: "2026-10-28",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Dra. Julia Arana",
    image: "/talleres/tallerBlender2.webp",
  }
];
