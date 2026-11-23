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

export type Evento = {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  location: string;
  category: Categoria;
  instructor: string;
  image: string;
};

export const eventos: Evento[] = [
  {
    id: 1,
    title: "Taller de Git y Github",
    description: "Taller donde se aprendieron los fundamentos de Git y Github",
    fullDescription:
      "En este taller se aprendieron los fundamentos de Git y Github, una herramienta de control de versiones de código abierto, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones.",
    date: "16 de febrero de 2024",
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
    date: "24 de febrero de 2024",
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
    date: "12 de marzo de 2024",
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
    date: "28 de octubre de 2024",
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
    date: "29 de octubre de 2024",
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
    date: "29 de octubre de 2024",
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
    date: "14 de agosto de 2025",
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
    date: "26 de septiembre de 2025",
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
    date: "26 de septiembre de 2025",
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
    date: "28 de noviembre de 2025",
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
    date: "28 de noviembre de 2025",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Paulo Mantilla",
    image: "/talleres/tallerSwiftUI.webp",
  },
  {
    id: 12,
    title: "Wieeek 2026 - Primera Edición: Desarrollo de Videojuegos",
    description:
      "Tres días de talleres presenciales para crear videojuegos con Roblox, Unity y Blender, organizados por la IEEE Student Branch de la Escuela Superior de Tlahuelilpan.",
    fullDescription:
      "La primera edición de WIEEEK 2026 es un evento presencial de tres días (del 26 al 28 de octubre de 2026) enfocado en el desarrollo de videojuegos. Se imparten cuatro actividades en paralelo donde aprenderas nuevas habilidades en el desarrollo de videojuegos. El evento es organizado por la IEEE Student Branch de la Escuela Superior de Tlahuelilpan, con el apoyo de la Coordinación de la Licenciatura en Ingeniería de Software.",
    date: "26 de octubre de 2026",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Evento",
    instructor: "IEEE - Escuela Superior de Tlahuelilpan Student Branch",
    image: "/eventos/wieeekFlyer.webp",
  },
  {
    id: 13,
    title: "Torneo E-Sports",
    description:
      "Torneo presencial de 3 días para competir en los videojuegos Minecraft, Clash Royale y FC27.",
    fullDescription:
      "El torneo presencial de E-Sports se llevará a cabo durante los tres días del evento. Los participantes competirán en tres videojuegos: Minecraft, Clash Royale y FC27. Se premiará a los primeros 3 lugares con mayor puntaje dentro de la tabla general.",
    date: "26 de octubre de 2026",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Evento",
    instructor: "IEEE - Escuela Superior de Tlahuelilpan Student Branch",
    image: "/eventos/e-sportFlyer.webp",
  },
  {
    id: 14,
    title: "Despliega tu Servidor de Minecraft en AWS EC2",
    description:
      "Taller práctico de 4 horas para crear y administrar un servidor multijugador de Minecraft alojado en Amazon EC2.",
    fullDescription:
      "Te invitamos al taller presencial organizado por el AWS Student Builder Group UAEH, impartido por Rodrigo Roldán, donde aprenderás a aprovisionar, asegurar y automatizar la infraestructura completa de un servidor de Minecraft Java Edition utilizando la nube de Amazon Web Services (AWS)",
    date: "26 de octubre de 2026",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "AWS Student Builder Group - UAEH",
    image: "/talleres/tallerCORE.webp",
  },
  {
    id: 15,
    title: "Desarrollo de Videojuegos en Roblox",
    description:
      "Taller presencial de 9 horas en total enfocado en la creación y publicación de un nivel jugable en Roblox.",
    fullDescription:
      "En este taller impartido por el Dr. Ismael Domínguez, trabajarás durante 3 horas por día en los días 1, 2 y 3 del evento. El objetivo principal y entregable final es crear un nivel jugable publicado en Roblox.",
    date: "26 de octubre de 2026",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Dr. Ismael Domínguez",
    image: "/talleres/tallerRoblox.webp",
  },
  {
    id: 16,
    title: "Desarrollo en Unity",
    description:
      "Taller continuo de 6 horas donde desarrollarás una escena con un personaje animado y controlable en Unity.",
    fullDescription:
      "Impartido por el Lic. Moisés Valenzuela, este taller se realiza en un bloque continuo de 3 horas durante los días 1 y 2. Al finalizar tu participación en el Laboratorio 2, deberás entregar una escena con un personaje animado y controlable.",
    date: "26 de octubre de 2026",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Lic. Moisés Valenzuela",
    image: "/talleres/tallerUnity.webp",
  },
  {
    id: 17,
    title: "Creación de assets en Blender",
    description:
      "Taller de 9 horas dedicado al modelado 3D para la creación de un set de modelos exportados y listos para motor.",
    fullDescription:
      "La Dra. Julia Arana impartirá este taller de 3 horas diarias durante los tres días del evento en el Laboratorio 3. Aprenderás a diseñar elementos 3D con el objetivo de entregar un set de modelos exportados listos para usarse en un motor gráfico.",
    date: "26 de octubre de 2026",
    location: "Escuela Superior de Tlahuelilpan",
    category: "Taller",
    instructor: "Dra. Julia Arana",
    image: "/talleres/tallerBlender.webp",
  }
];
