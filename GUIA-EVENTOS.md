# Guía para administrar eventos y talleres

Esta guía es para quien administra el sitio de la Rama Estudiantil IEEE-ESTl.
No hace falta saber programar: todo se hace editando dos archivos de datos.

---

## Índice

1. [Antes de empezar](#antes-de-empezar)
2. [Los dos archivos](#los-dos-archivos)
3. [Los campos de un evento](#los-campos-de-un-evento)
4. [Las categorías](#las-categorías)
5. [Los estados de un evento](#los-estados-de-un-evento)
6. [Cómo funcionan los formularios](#cómo-funcionan-los-formularios)
7. [Flujo completo: crear y publicar](#flujo-completo-crear-y-publicar)
8. [Probar los formularios](#probar-los-formularios)
9. [Ver y limpiar los datos](#ver-y-limpiar-los-datos)
10. [Errores frecuentes](#errores-frecuentes)

---

## Antes de empezar

Abre una terminal en la carpeta del proyecto y levanta el sitio:

```bash
bun dev
```

Fíjate en el puerto que anuncia. Si el 3000 está ocupado usará el 3001.
Conviene trabajar en el **3000**, porque es el valor configurado para el inicio
de sesión del panel interno.

Solo necesitas una segunda terminal con `bunx convex dev` si vas a modificar
archivos dentro de la carpeta `convex/`. Para administrar eventos no hace falta.

---

## Los dos archivos

| Archivo | Qué contiene | Dónde se ve |
|---|---|---|
| `src/app/data/comingSoon.ts` | Lo que **viene** | Inicio, `/coming-soon`, formularios |
| `src/app/data/events.ts` | Lo que **ya pasó** | `/events` |

**No existe un campo de "estado" ni una casilla de "finalizado".** Un evento es
próximo porque está escrito en `comingSoon.ts`, y es historial porque está en
`events.ts`. Mover el objeto de un archivo a otro *es* cambiarle el estado.

Se diseñó así para que no pueda haber contradicciones: un campo
`estado: "finalizado"` dentro de la lista de próximos eventos sería un dato que
se contradice a sí mismo, y algún día alguien confiaría en el equivocado.

---

## Los campos de un evento

### Obligatorios (9)

Declarados en `src/app/data/events.ts`, en `export type Evento`.

| Campo | Tipo | Para qué sirve | Ejemplo |
|---|---|---|---|
| `id` | número | Identificar la tarjeta. Debe ser único | `14` |
| `title` | texto | Nombre. **También genera el identificador que se guarda en la base** | `"Taller de Docker"` |
| `description` | texto | Frase corta, se ve en la tarjeta | `"Aprende contenedores desde cero."` |
| `fullDescription` | texto | Texto largo, se ve al abrir el modal | `"En este taller..."` |
| `date` | texto | Fecha **para leer**, formato libre | `"3 de marzo de 2027"` |
| `location` | texto | Dónde | `"Escuela Superior de Tlahuelilpan"` |
| `category` | lista cerrada | Decide el formulario y el color | `"Taller"` |
| `instructor` | texto | Quién lo imparte | `"Paulo Mantilla"` |
| `image` | texto | Ruta desde `public/` | `"/tallerGit.webp"` |

Si omites cualquiera, el proyecto no compila. Es intencional: un evento sin
fecha o sin lugar no sirve publicado.

### Opcionales (3)

Solo existen en `comingSoon.ts`, porque solo tienen sentido para algo que aún
no ocurre.

| Campo | Qué hace |
|---|---|
| `registroAbierto` | `true` lo pone en el formulario. Sin él, se anuncia sin inscripción |
| `fechaLimiteRegistro` | `"AAAA-MM-DD"`. Al pasar ese día, el registro se cierra solo |
| `registerLink` | Manda a una página externa en vez de al formulario propio |

### Plantilla para copiar

```ts
    {
        id: 14,
        title: "Taller de Docker",
        description: "Aprende a empaquetar aplicaciones con contenedores.",
        fullDescription: "En este taller aprenderás qué es un contenedor, cómo construir una imagen y cómo levantar tu aplicación en cualquier equipo.",
        date: "3 de marzo de 2027",
        location: "Escuela Superior de Tlahuelilpan",
        category: "Taller",
        instructor: "Paulo Mantilla",
        image: "/tallerGit.webp",
        registroAbierto: true,
        fechaLimiteRegistro: "2027-03-01",
    },
```

Va dentro de los corchetes de `proximos`, separado del anterior por una coma.

### Los dos campos que más se equivocan

**`title` no es solo decorativo.** De él se genera el identificador que se
guarda en la base: `"Taller de Docker"` se convierte en `taller-de-docker`, y
eso es lo que verás en el panel. Por eso dos eventos con el mismo título quedan
indistinguibles, y por eso la consola te avisa cuando ocurre.

**`image` se escribe sin `/public`.** Esa carpeta *es* la raíz del sitio.
Un archivo en `public/logo.png` se escribe `"/logo.png"`.

Respeta mayúsculas y minúsculas exactamente. En Windows parece funcionar de
cualquier forma, pero el servidor sí distingue: `tallerAWS.jpg` da imagen rota
donde `tallerAws.jpg` funciona.

---

## Las categorías

La lista está en `src/app/data/events.ts`, en `export const CATEGORIAS`.
Es una lista **cerrada**: solo se aceptan estos cinco valores.

| Categoría | Qué es | Cuándo usarla | Color |
|---|---|---|---|
| **Taller** | Sesión práctica donde se aprende haciendo | Alguien enseña una herramienta y los asistentes la usan | Azul |
| **Hackathon** | Competencia con tiempo límite | Se compite, hay entrega, suele haber premios | Verde |
| **Congreso** | Evento de varios días con múltiples actividades | Un CINSOFT: agenda amplia, varios ponentes | Rojo |
| **Conferencia** | Una charla: alguien expone, el público escucha | Un invitado habla de un tema, sin práctica | Morado |
| **Evento** | Todo lo demás | Bienvenidas, convivencias, reuniones sociales | Amarillo |

### Qué decide la categoría

**A qué formulario va la inscripción.** La regla es binaria:

```
"Taller"      -> /register-workshop   (solo alumnos, exige correo @uaeh.edu.mx)
las otras 4   -> /register-event      (acepta externos)
```

Esto viene de que los talleres son internos de la ESTl. Un hackathon, congreso
o conferencia pueden recibir gente de otras escuelas, y por eso ese formulario
tiene la opción de grupo "Externo".

**El color de la etiqueta**, según el mapa `COLOR_CATEGORIA` del mismo archivo.

No decide nada más: ni validaciones, ni campos, ni el diseño de la tarjeta.

### Agregar una categoría nueva

1. Añádela a `CATEGORIAS` en `events.ts`
2. Guarda y mira la terminal: dirá que falta su color
3. Agrégalo en `COLOR_CATEGORIA`

Ese error del paso 2 no es un problema, es el sistema recordándote el paso que
falta. El mapa de colores está declarado de forma que **toda categoría debe
tener color** o el proyecto no compila.

Una categoría nueva irá a `/register-event` por defecto. Si debe ser solo para
alumnos, hay que ajustar `rutaDeRegistro` y `opcionesDeRegistro` en
`comingSoon.ts`.

---

## Los estados de un evento

| Estado | Cómo se logra | Inicio | `/coming-soon` | Formulario | `/events` |
|---|---|---|---|---|---|
| **1. No existe** | No está escrito | — | — | — | — |
| **2. Anunciado** | En `comingSoon.ts`, sin `registroAbierto` | Sí | Sí | — | — |
| **3. Inscripción abierta** | `registroAbierto: true`, fecha vigente o sin fecha | Sí | Sí | Sí | — |
| **4. Inscripción cerrada** | `registroAbierto: true` + fecha límite vencida | Sí | Sí | — | — |
| **5. Finalizado** | Movido a `events.ts` | — | — | — | Sí |

Los estados 2 y 4 se ven igual para el visitante, pero significan cosas
distintas: el 2 es "todavía no abrimos", el 4 es "ya cerramos".

### Qué determina que salga en "Próximamente"

Una sola condición: **estar en la lista `proximos`**. Ni la fecha del evento, ni
si el registro está abierto, ni la categoría.

En el inicio, la sección aparece cuando esa lista tiene al menos un elemento.
Con la lista vacía, la sección desaparece y `/coming-soon` muestra un mensaje.

### Las transiciones

**Abrir inscripciones (2 → 3).** Agrega `registroAbierto: true`.

**Cerrar inscripciones (3 → 4).** Dos formas:

- *Automática*: `fechaLimiteRegistro: "2027-03-01"`. Se cierra solo al terminar
  ese día. Es la recomendada: no depende de que alguien se acuerde.
- *Manual*: `registroAbierto: false`. Sirve para cerrar antes de lo previsto.

**Archivar (4 → 5).** Tres pasos:

1. Corta el objeto de `comingSoon.ts`
2. Pégalo dentro de `eventos` en `events.ts`
3. **Borra** las líneas `registroAbierto`, `fechaLimiteRegistro` y `registerLink`

El paso 3 no es opcional: `events.ts` usa un tipo que no conoce esos campos, y
el proyecto no compilará si los dejas.

**Archivar un evento NO borra las inscripciones.** Siguen en la base y en el
panel — ahí está tu lista de asistentes. Mover el evento solo cambia lo que ve
el público.

### Dos cosas que el sistema no hace

**No hay publicación programada.** No puedes escribir un evento hoy para que
aparezca solo el día 15. En cuanto lo agregas y despliegas, está visible. Para
adelantar trabajo sin publicar, déjalo en una rama de git sin fusionar.

**El cierre por fecha se evalúa cuando alguien abre la página**, no por un
proceso corriendo en el servidor. En la práctica da igual, pero conviene saberlo.

---

## Cómo funcionan los formularios

**No existe un interruptor de abrir/cerrar.** El estado del formulario se
deduce de los datos de los eventos: si hay al menos uno con inscripción vigente
de esa categoría, el formulario se muestra; si no, dice "Registro Cerrado".

Antes sí había un interruptor separado, y era justo lo que se quedaba
desactualizado.

### `registroAbierto` frente a `registerLink`

Son cosas distintas y se confunden con facilidad.

| | `registroAbierto: true` | `registerLink: "https://..."` |
|---|---|---|
| A dónde va la persona | Al formulario del sitio | A una página externa |
| Dónde llegan los datos | **A la base y al panel interno** | A donde apunte el enlace |
| ¿Los ves en el panel? | **Sí** | **No** |

Usa `registroAbierto` casi siempre. Usa `registerLink` solo cuando la
inscripción no la controlan ustedes: un congreso con otra institución, un
evento donde el registro vive en la página de un patrocinador.

Si pones los dos, gana `registerLink`.

### Diferencia entre los dos formularios

| | `/register-workshop` | `/register-event` |
|---|---|---|
| Correo | Solo `@uaeh.edu.mx` | Cualquiera |
| Grupo | 8 opciones (101 a 702) | Las mismas **+ "Externo"** |
| Teléfono | Mínimo 8 dígitos | Mínimo 10 |
| Guarda en | `workshopRegistrations` | `eventRegistrations` |

---

## Flujo completo: crear y publicar

### 1. Prepara la información

Nombre, fecha, lugar, quién lo imparte, frase corta, párrafo largo e imagen.
**Copia la imagen a `public/` antes de escribir nada**, para no apuntar a un
archivo que no existe.

### 2. Elige la categoría

Pregúntate qué van a *hacer* los asistentes, no cómo se llama el evento. El
título es para las personas; la categoría es para el sistema.

### 3. Escribe el objeto

En `comingSoon.ts`, dentro de `proximos`. Usa la plantilla. Revisa que el `id`
no choque con los existentes.

### 4. Decide el estado inicial

| Situación | Qué escribes |
|---|---|
| Ya pueden inscribirse | `registroAbierto: true` |
| Anunciar sin abrir cupos | omite `registroAbierto` |
| Hay fecha de cierre | `fechaLimiteRegistro: "AAAA-MM-DD"` |
| El registro lo lleva alguien más | `registerLink: "https://..."` |

### 5. Verifica, en este orden

```
1. La terminal de `bun dev` no muestra errores
2. La consola del navegador (F12) está limpia
3. La tarjeta se ve en el inicio y en /coming-soon, con la imagen cargada
4. La etiqueta tiene el color correcto de su categoría
5. El evento aparece en el formulario que le toca
```

Si algo falla, el problema casi siempre está en el paso anterior al que falló.

### 6. Publica

Los cambios locales no llegan al sitio solos:

```bash
git add src/app/data/comingSoon.ts
git commit -m "eventos: anuncia el Taller de Docker"
git push
```

---

## Probar los formularios

**Talleres** — prueba a propósito con un Gmail: debe rechazarlo. Esa validación
corre en el servidor, no solo en el navegador.

**Eventos** — acepta cualquier correo y tiene la opción de grupo "Externo".

**Únete a la rama** — prueba las dos rutas, Miembro y Miembro del staff. Al
elegir staff debe aparecer un selector de rol.

**Queremos Conocerte** — solo se puede responder una vez. Para repetir la prueba
hay que borrar dos cosas:

1. `F12` → Application → Local Storage → localhost → borra la clave
   `ieee-estl:queremos-conocerte-respondido`
2. El registro en la base

Si solo borras la del navegador, el servidor rechaza por nombre y grupo
repetidos.

---

## Ver y limpiar los datos

**El panel interno**, que es lo normal:

```
/dashboard
```

Cuatro pestañas, búsqueda, orden por columna y exportación.

**Desde la terminal**, para ver los datos crudos:

```bash
bunx convex data workshopRegistrations
```

Cambia el nombre por `eventRegistrations`, `joinRequests` o `studentInterests`.

**Para borrar**, el panel es de solo lectura a propósito. Usa el panel de Convex:

```bash
bunx convex dashboard
```

---

## Errores frecuentes

| Lo que ves | Qué pasó |
|---|---|
| `Type '"X"' is not assignable to type '"Taller" \| ...` | Categoría mal escrita. El mensaje sugiere la correcta |
| `Property 'X' is missing in type ... Record<Categoria, string>` | Agregaste una categoría y falta su color |
| `[comingSoon.ts] 2 eventos generan el identificador...` | Dos títulos iguales. Cambia uno |
| `Cannot read properties of undefined (reading 'title')` | Coma de más en la lista, dejó un hueco |
| `Failed to load chunk` | Caché rancia (ver abajo) |
| Imagen rota | La ruta lleva `/public` de más, o no coinciden las mayúsculas |
| "Registro Cerrado" sin esperarlo | Ningún evento de esa categoría tiene inscripción vigente |

### Caché rancia

Si ves `Failed to load chunk`, no es un error de programación: el navegador pide
archivos que ya no existen. Detén el servidor y:

```bash
Remove-Item -Recurse -Force .next
bun dev
```

Luego recarga con `Ctrl + Shift + R`. Un `F5` normal puede seguir usando los
archivos viejos.

---

## El ciclo de un semestre, resumido

```
Anunciar     -> agregar objeto a comingSoon.ts con registroAbierto: true
Cerrar cupos -> fechaLimiteRegistro, o registroAbierto: false
Archivar     -> mover a events.ts y borrar los 3 campos opcionales
```

Tres momentos, dos archivos, nada de tocar código de interfaz. Las inscripciones
recibidas se quedan en la base pase lo que pase.
