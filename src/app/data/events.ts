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
    "Hackathon",
    "Congreso",
    "Conferencia",
    "Evento",
] as const

export type Categoria = (typeof CATEGORIAS)[number]

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
    Hackathon: "bg-green-100 text-green-800 hover:bg-green-200",
    Congreso: "bg-red-100 text-red-800 hover:bg-red-200",
    Conferencia: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    Evento: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
}

export type Evento = {
    id: number
    title: string
    description: string
    fullDescription: string
    date: string
    location: string
    category: Categoria
    instructor: string
    image: string
}

export const eventos: Evento[] = [
    {
        id: 1,
        title: "Taller de Git y Github",
        description: "Taller donde se aprendieron los fundamentos de Git y Github",
        fullDescription: "En este taller se aprendieron los fundamentos de Git y Github, una herramienta de control de versiones de código abierto, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones.",
        date: "16 de febrero de 2024",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Johan González",
        image: "/tallerGit.webp",
    },
    {
        id: 2,
        title: "Frontend Hackathon",
        description: "Hackathon donde se desarrolló una aplicación web de recetario",
        fullDescription: "En este hackathon se desarrolló una aplicación web de recetario utilizando el framework de tu preferencia, fue una gran oportunidad para que los estudiantes pusieran a prueba sus habilidades de desarrollo web.",
        date: "24 de febrero de 2024",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Hackathon",
        instructor: "Erick Medel",
        image: "/hackathon-frontend.jpeg",
    },
    {
        id: 3,
        title: "Taller de PostgreSQL",
        description: "Taller donde se aprendieron los fundamentos de PostgreSQL",
        fullDescription: "En este taller se aprendieron los fundamentos de PostgreSQL, una base de datos relacional de código abierto, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias bases de datos.",
        date: "12 de marzo de 2024",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Ángel Enrique Romero Cuevas",
        image: "/tallerSql.webp",
    },
    {
        id: 4,
        title: "Cinsoft 2024",
        description: "Congreso de Software donde hubieron talleres, conferencias y mucho más",
        fullDescription: "En este congreso se realizaron talleres, conferencias y mucho más, fue una gran oportunidad para que los estudiantes aprendieran sobre el mundo del software y la tecnología. El evento fue organizado por la IEEE - Escuela Superior de Tlahuelilpan Student Branch con apoyo de la Licenciatura en Ingeniería de Software.",
        date: "28 de octubre de 2024",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Congreso",
        instructor: "IEEE - Escuela Superior de Tlahuelilpan Student Branch",
        image: "/cinsoft.webp",
    },
    {
        id: 5,
        title: "Taller de Azure",
        description: "Taller donde se aprendieron los fundamentos de Azure",
        fullDescription: "En este taller se aprendieron los fundamentos de Azure, una plataforma de cloud computing de Microsoft, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones en la nube.",
        date: "29 de octubre de 2024",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Brujería Tech",
        image: "/tallerAzure.jpg",
    },
    {
        id: 6,
        title: "Taller de AWS",
        description: "Taller donde se aprendieron los fundamentos de AWS",
        fullDescription: "En este taller se aprendieron los fundamentos de AWS, una plataforma de cloud computing de Amazon, este taller fue de mucha utilidad para aquellos estudiantes que estaban interesados en aprender a programar y a crear sus propias aplicaciones en la nube. Se desarrolló una aplicación CRUD usando Node.js y Express.",
        date: "29 de octubre de 2024",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Ing. Hugo Alejandres",
        image: "/tallerAws.jpg",
    },
    {
        id: 7,
        title: "Welcome Back",
        description: "Prepárate para un evento lleno de sorpresas, oportunidades y mucha actitud.",
        fullDescription: "En este evento, podrás reecontrarte con tus amigos, conocer nuevos compañeros y arrancar el semestre con toda la energía.",
        date: "14 de agosto de 2025",
        location: "Auditorio de la ESTl",
        category: "Evento",
        instructor: "IEEE ESTl Student Branch",
        image: "/welcomeback.jpeg",
    },
    {
        id: 8,
        title: "Taller de React y Tailwind",
        description: "Taller donde se aprendieron los fundamentos de React y Tailwind para crear aplicaciones web modernas y responsivas.",
        fullDescription: "En este taller, aprenderás los fundamentos de React y Tailwind para crear aplicaciones web modernas y responsivas. Aprenderás a crear componentes reutilizables, a manejar el estado de la aplicación y a crear interfaces de usuario atractivas.",
        date: "26 de septiembre de 2025",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Paulo Mantilla",
        image: "/tallerReact.webp",
    },
    {
        id: 9,
        title: "Primeros pasos: Impresión 3D",
        description: "Taller donde se aprendieron los fundamentos de la impresión 3D y cómo usarlo para crear tus propios proyectos.",
        fullDescription: "En este taller, aprenderás los fundamentos de la impresión 3D y cómo usarlo para crear tus propios proyectos. Aprenderás a crear modelos en 3D, a imprimirlos y a usarlos para crear tus propios proyectos.",
        date: "26 de septiembre de 2025",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Mario Lozano",
        image: "/taller3D.webp",
    },
    {
        id: 10,
        title: "Hackathon Frontend",
        description: "Únete a nuestro hackathon de frontend y demuestra tus habilidades al crear increíbles interfaces de usuario para una web de peliculas!.",
        fullDescription: "Aprende nuevas tecnologías y compite por premios emocionantes mientras desarrollas soluciones creativas para mejorar la experiencia del usuario. Tu misión será diseñar una interfaz de usuario que sea atractiva, intuitiva y funcional.",
        date: "28 de noviembre de 2025",
        location: "Online",
        category: "Hackathon",
        instructor: "Equipo IEEE ESTl",
        image: "/hackathon-frontend-2025.webp",
    }
]
