# PLAN DE IMPLEMENTACIÓN — IEEE ESTl Student Hub

> Documento vivo. Registra las implementaciones acordadas, su orden de ejecución, las ramas
> sugeridas y la segmentación de commits. Se actualiza conforme avancemos o se agreguen
> nuevas implementaciones.

**Rama base de trabajo:** `dev`
**Flujo:** `dev` → `feat/<nombre>` → (revisión) → merge a `dev` → *(al final de todo)* merge a `main`

`main` **no se toca hasta que las 7 implementaciones estén terminadas.** Se integra todo en `dev`
y se hace un solo merge a `main` al cerrar el plan. `dev` y las ramas `feat/*` sí se suben al
remoto conforme se avanza: es el único respaldo del trabajo y da visibilidad al resto del equipo.
No hay CI, así que ningún push dispara un deploy.

---

## Reglas de trabajo acordadas

1. **Una implementación a la vez.** No se avanza a la siguiente fase hasta cerrar la anterior.
2. **Cada implementación vive en su propia rama** `feat/*` creada a partir de `dev`.
3. **Claude no ejecuta `git commit` ni `git branch`.** Yo (Claude) entrego:
   - el nombre sugerido de la rama,
   - los cambios segmentados en commits lógicos con su mensaje y los archivos de cada uno.

   Tú los aplicas manualmente.
4. **Rol de mentoría en Convex.** Es tecnología nueva para ti: cada paso se explica antes de
   ejecutarlo, y se te pide explícitamente lo que necesito de tu lado (cuentas, claves,
   decisiones) en lugar de asumirlo.

---

## Decisiones tomadas

Resueltas antes de empezar. Quedan registradas aquí para no volver a abrirlas a mitad de una fase.

| # | Decisión | Resolución |
|---|---|---|
| 1 | ¿Qué protege `/dashboard`? | **Convex Auth** con proveedor de contraseña. **Una sola cuenta** para el equipo, cuyas credenciales no se comparten fuera de él. El registro público queda deshabilitado. |
| 2 | ¿Se conserva la notificación por correo? | **Sí, solo para "Únete a la rama".** Resend se queda, pero hay que actualizar el dominio remitente (se vuelve a comprar) y el correo destinatario. Ningún otro formulario manda correo. |
| 3 | ¿"Queremos Conocerte" pide contacto? | **No. Sin email ni teléfono**, tal como está el banco de preguntas. |
| 4 | ¿Se evitan respuestas duplicadas? | **Sí.** Doble barrera: marca en `localStorage` + verificación en el servidor por nombre + grupo (ver Fase 4). |
| 5 | ¿El dashboard permite borrar? | **No. Solo lectura.** |
| 6 | ¿Cuándo se actualiza el dominio de Resend? | **Al final (Fase 7).** `ieee-estl.com` aún no está configurado y el correo destinatario no está definido. |
| 7 | ¿Se arregla el build roto antes de la Fase 3? | **No.** Se espera a la Fase 3, que lo arregla al eliminar los archivos culpables. `main` queda sin poder desplegarse hasta entonces. |
| 8 | ¿Se rescatan los datos históricos de Supabase? | **No. Se dan por perdidos.** Nadie conserva acceso al panel. Convex arranca vacío. |
| 9 | ¿Se recupera la cuenta de Resend? | **No. Se crea una nueva**, cuando esté definido el correo destinatario (Fase 7). |
| 10 | ¿Cuándo se mergea a `main`? | **Solo al terminar las 7 fases.** Hasta entonces todo se integra en `dev`, que sí se sube al remoto. |

---

## Estado del entorno (verificado el 2026-08-26)

**Ya no existe ninguna variable de entorno del proyecto.** Las de Clerk, Supabase y Resend
dejaron de existir y nadie del equipo las conserva. `wrangler.jsonc` no declara variables ni
secretos, y no hay `.dev.vars` local.

Consecuencias verificadas:

- **El proyecto no compilaba** al escribirse este documento: `src/config/supabaseClient.ts` y
  `src/app/api/send/route.ts` inicializaban sus clientes en scope de módulo, y `next build`
  tronaba con *"supabaseUrl is required"* y *"Missing API key"*. Ambos archivos se eliminaron en
  la Fase 3. El build sigue necesitando `NEXT_PUBLIC_CONVEX_URL`, pero ahora falla con un mensaje
  accionable (ver *Efecto sobre el build* en la Fase 3).
- **El sitio está fuera de línea.** `ieee-estl.com` no está pagado ni configurado. El último
  commit en `main` es del **2026-02-26**. No hay nada desplegado que se pueda romper.
- **Los tres formularios están muertos**, y no hay datos que rescatar: nadie conserva acceso al
  panel de Supabase, así que los registros históricos de talleres y eventos **se dan por
  perdidos**. Convex arranca vacío.
- **No hay workflows de CI** (`.github/` no existe), así que ningún merge dispara un deploy
  automático. Mergear a `main` es seguro aunque el build falle.
- **`main` no es desplegable hasta la Fase 3.** Las fases 1 y 2 pueden mergearse como código,
  pero no tiene sentido intentar un deploy antes.

### Sobre las claves "perdidas"

Hay que distinguir dos casos:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` — el prefijo `NEXT_PUBLIC_` hace
  que Next las **incruste en el bundle del navegador** en tiempo de build. Si el sitio de febrero
  sigue en línea, siguen siendo legibles por cualquiera. No están perdidas: están públicas, y
  siempre lo estuvieron. Toda la protección dependía de las políticas RLS de Supabase.
- `RESEND_API_KEY` y las de Clerk — server-side. Esas sí se perdieron.

Lo que decide si los datos históricos se rescatan no es la anon key, sino **si alguien conserva
acceso al panel de Supabase**. Pregunta abierta (ver Fase 3).

**Consecuencia de la decisión 1 que conviene tener presente:** con una sola cuenta compartida no
hay trazabilidad de quién entró ni quién exportó datos, y rotar la contraseña obliga a avisar a
todo el equipo. Es un compromiso razonable para un equipo pequeño; si más adelante quieren
cuentas individuales, Convex Auth ya lo soporta y solo habría que dar de alta más usuarios.

**Riesgo de seguridad a cubrir en la Fase 6:** el proveedor de contraseña de Convex Auth permite
**auto-registro por defecto**. Si se deja así, cualquiera que descubra `/dashboard` puede crearse
una cuenta y leer todas las respuestas. La Fase 6 debe deshabilitar explícitamente el alta de
usuarios y dejar solo el inicio de sesión.

---

## Estado actual del proyecto (punto de partida)

| Área | Hoy | Después de este plan |
|---|---|---|
| Base de datos | Supabase (`@supabase/supabase-js`, anon key en cliente) | **Convex** |
| Auth | Clerk (`clerkMiddleware` sin rutas protegidas) | **Convex Auth**, solo para `/dashboard` (ver Fase 6) |
| Email | Resend (`POST /api/send`) | **Se conserva**, solo para "Únete a la rama"; dominio y destinatario actualizados |
| Home | `Inicio` + `Unete` + `FAQ` (`Events` y `ComingSoon` comentados) | `Inicio` + `ComingSoon` (condicional) + `Queremos Conocerte` + `Unete` + `FAQ` |
| Eventos | Componentes comentados en el home | Páginas propias `/events` y `/coming-soon` |
| Panel admin | No existe | `/dashboard` privado con Data Tables |

### Formularios que existen hoy y a dónde escriben

| Formulario | Componente | Destino actual | Destino futuro (tabla Convex) |
|---|---|---|---|
| Únete a la rama | `JoinDialog.tsx` | Resend → 3 correos | `joinRequests` **+ correo de aviso (Resend)** |
| Registro a talleres | `registration-form.tsx` | Supabase tabla `ieee-workshops` | `workshopRegistrations` |
| Registro a eventos | `registration-event-form.tsx` | Supabase RPC `register_attendee` | `eventRegistrations` |
| Queremos Conocerte | *(no existe)* | — | `studentInterests` |

---

## Orden de ejecución

El orden **no** es el mismo en que se listaron las implementaciones: **primero se levanta Convex,
luego se migran los formularios, y hasta entonces se elimina el stack viejo.** No se puede borrar
la capa de datos antes de tener la que la reemplaza. Clerk sí sale de inmediato porque no protege
ninguna ruta.

> **Corrección.** La primera versión de este plan justificaba el orden diciendo que borrar
> Supabase antes rompería los formularios en producción. Eso resultó falso: sin variables de
> entorno, los formularios **ya están rotos** (ver *Estado del entorno*). El orden se sostiene por
> la razón de arriba, pero no hay nada que proteger ni urgencia por llegar a la Fase 3.

```
Fase 1  →  Eliminar Clerk                      feat/remove-clerk
Fase 2  →  Instalar y configurar Convex        feat/convex-setup
Fase 3  →  Migrar formularios + eliminar
           Supabase (Resend se conserva)       feat/convex-forms-migration
Fase 4  →  Sección "Queremos Conocerte"        feat/queremos-conocerte
Fase 5  →  Páginas /events y /coming-soon      feat/events-pages
Fase 6  →  Dashboard administrativo privado    feat/admin-dashboard
Fase 7  →  Dominio y correo de Resend          feat/resend-domain-update
```

La Fase 7 va al final porque depende de algo externo al código: que `ieee-estl.com` quede
configurado y que se defina el correo destinatario. Nada más del plan la bloquea.

---

## Fase 1 — Eliminar Clerk

**Rama sugerida:** `feat/remove-clerk`

### Alcance

Clerk hoy está instalado y envuelve toda la app, pero no protege ninguna ruta ni hay área
privada. Su única función real es el webhook `user.created` que escribe en Supabase — que
también desaparece.

### Cambios

- Quitar `<ClerkProvider>` de `src/app/layout.tsx`.
- Quitar `SignedIn`, `SignedOut`, `SignInButton`, `UserButton` de `src/components/Navbar.tsx`.
- Eliminar `src/middleware.ts` (el `clerkMiddleware()` global).
- Eliminar `src/app/api/webhooks/clerk/route.ts`.
- Eliminar el directorio local `.clerk/`.
- Desinstalar `@clerk/nextjs` y `svix` de `package.json`.
- Retirar las variables de Clerk del entorno local y del entorno de Cloudflare.

### Riesgo / nota

Al quitar el middleware, la app deja de tener cualquier capa de auth. Es intencional: la
autenticación vuelve en la Fase 6, exclusivamente para `/dashboard`.

### Commits sugeridos

1. `refactor(auth): remove ClerkProvider and auth UI from layout and navbar`
   → `src/app/layout.tsx`, `src/components/Navbar.tsx`
2. `refactor(auth): delete clerk middleware and user webhook`
   → `src/middleware.ts`, `src/app/api/webhooks/clerk/route.ts`
3. `chore(deps): drop @clerk/nextjs and svix`
   → `package.json`, `bun.lock`

### Lo que necesito de ti

- Confirmación de que el webhook de Clerk puede desactivarse en su dashboard, para que deje de
  disparar contra una ruta que ya no existirá.

---

## Fase 2 — Instalar y configurar Convex

**Rama sugerida:** `feat/convex-setup`

> **Fase de mentoría.** Aquí no se toca ningún formulario todavía: el objetivo es dejar Convex
> instalado, conectado y con el esquema de datos definido, verificando cada paso.

### Qué es Convex (contexto rápido)

Convex es una base de datos reactiva con backend TypeScript integrado. A diferencia de Supabase,
no escribes SQL ni expones una clave anónima que dependa de políticas RLS: defines funciones en
`convex/` (`query`, `mutation`) que corren **en el servidor de Convex**, y el cliente solo puede
invocar esas funciones. Eso resuelve de raíz el problema que hoy tiene el proyecto de escribir a
la base de datos desde el navegador con la anon key.

Tres conceptos que usaremos:

- **`schema.ts`** — define las tablas y sus tipos. Convex los valida en tiempo de ejecución.
- **`mutation`** — función que escribe (enviar un formulario).
- **`query`** — función que lee, y es **reactiva**: el dashboard se actualiza solo cuando llega
  una respuesta nueva, sin refrescar.

### Pasos (los ejecutaremos juntos, uno por uno)

**Paso 1 — Cuenta y proyecto.** Necesito que crees una cuenta en convex.dev (el plan gratuito es
más que suficiente para este volumen de datos). No requiero tus credenciales: tú te autenticas
desde tu terminal en el paso 3.

**Paso 2 — Instalación de la dependencia.**

```bash
bun add convex
```

**Paso 3 — Inicialización.**

```bash
bunx convex dev
```

Este comando abre el navegador para que inicies sesión, pregunta si crear un proyecto nuevo
(elegimos uno nuevo, nombre sugerido `ieee-esti-student-hub`), crea la carpeta `convex/`,
escribe `CONVEX_DEPLOYMENT` y `NEXT_PUBLIC_CONVEX_URL` en `.env.local`, y se queda corriendo
sincronizando cambios. **Se deja corriendo en una terminal aparte mientras desarrollamos.**

**Paso 4 — Esquema de datos** (`convex/schema.ts`):

```
joinRequests            // formulario "Únete a la rama"
  nombreCompleto, email, telefono, razonUnirse,
  tipoParticipacion: "member" | "staff-member", rolStaff?

workshopRegistrations   // registro a talleres
  nombreCompleto, email, telefono, grupo, taller

eventRegistrations      // registro a eventos
  nombreCompleto, email, telefono, grupo, evento

studentInterests        // "Queremos Conocerte" (Fase 4)
  nombreCompleto, grupoSemestre,
  interesesTecnologicos[], nivelExperiencia,
  formatoEventos[], industriaCuriosidad[],
  metaSemestre, claveDedup
  índice: by_claveDedup
```

Convex agrega automáticamente `_id` y `_creationTime` a cada documento, así que no necesitamos
campos de fecha propios.

**Dos decisiones tomadas al escribir el esquema:**

1. **Nombres de campo unificados en español.** Los formularios de talleres y eventos usaban
   `fullName`, `phone`, `group`; el de "Únete" usaba `nombreCompleto`, `telefono`. Como no hay
   datos que migrar y los tres formularios se reescriben en la Fase 3, se normalizó todo al
   español, que es el idioma de las etiquetas del formulario y de las columnas que verá el equipo
   en el dashboard. Los nombres de tabla se quedan en inglés por ser identificadores de código
   (`api.workshops.registrar`).
2. **Valores cerrados con `v.literal`** en lugar de `v.string()` para todas las opciones de
   selección (intereses, nivel, formatos, industrias, rol de staff). Convex rechaza en el servidor
   cualquier valor fuera de la lista, así que no puede entrar basura a la base aunque alguien
   llame la mutation directamente. El costo es que agregar una opción nueva obliga a editar el
   esquema, que es justo lo deseable: queda explícito.

**Las cuatro tablas se definen aquí, en la Fase 2**, incluida `studentInterests`. La Fase 4 solo
agrega su mutation, no vuelve a tocar el esquema.

**Paso 5 — Provider en la app.** Crear `src/app/ConvexClientProvider.tsx` (componente cliente
que monta `ConvexReactClient` con `NEXT_PUBLIC_CONVEX_URL`) y envolver `children` en
`src/app/layout.tsx`. Ocupa el mismo lugar que ocupaba `<ClerkProvider>`.

**Paso 6 — Verificación.** Una `query` de prueba que devuelva el conteo de documentos,
renderizada temporalmente, para confirmar que la conexión funciona de punta a punta antes de
migrar nada real.

### Commits sugeridos

1. `chore(deps): add convex`
   → `package.json`, `bun.lock`
2. `feat(convex): scaffold convex project and define data schema`
   → `convex/schema.ts`, `convex/_generated/*`, `convex/README.md`
3. `feat(convex): wire ConvexClientProvider into root layout`
   → `src/app/ConvexClientProvider.tsx`, `src/app/layout.tsx`
4. `chore: ignore convex local env files`
   → `.gitignore`

### Lo que necesito de ti

- Cuenta de Convex creada.
- Ejecutar `bunx convex dev` tú mismo (el login es interactivo y va ligado a tu cuenta).
- Confirmar el nombre del proyecto en Convex.
- *(Resuelto: Convex arranca vacío. No hay datos históricos que migrar — ver decisión 8.)*

> `bunx convex dev` no depende del build de Next, así que esta fase se puede completar y verificar
> aunque `bun run build` siga fallando. El build se arregla en la Fase 3.

---

## Fase 3 — Migrar formularios a Convex y eliminar Supabase

**Rama sugerida:** `feat/convex-forms-migration`

### Alcance

Los tres formularios existentes dejan de escribir a Supabase y pasan a Convex. **Resend se
conserva**, pero solo para el aviso de "Únete a la rama", y se le actualizan dominio y
destinatario. Solo cuando los tres formularios funcionen se borra Supabase.

### Los tres formularios, uno por uno

**Talleres** (`registration-form.tsx`) y **Eventos** (`registration-event-form.tsx`)
Sustituyen `supabase.from(...).insert()` y `supabase.rpc('register_attendee')` por una
`mutation` de Convex. No mandan correo. Directo.

**Únete a la rama** (`JoinDialog.tsx`) — el caso mixto
Tiene que hacer dos cosas en un solo envío: **guardar** la solicitud en Convex (para que aparezca
en el dashboard) y **avisar por correo** a la mesa directiva.

Se resuelve con una **`action` de Convex**, no con dos llamadas desde el navegador. Una `action`
es el tercer tipo de función de Convex (además de `query` y `mutation`): puede hacer llamadas a
servicios externos como Resend, cosa que una `mutation` no puede. El flujo queda:

```
JoinDialog  →  action submitJoinRequest
                 ├─ mutation interna: inserta en joinRequests
                 └─ Resend: envía el correo de aviso
```

Ventajas frente a dejar el `POST /api/send` actual: una sola llamada desde el cliente, la
`RESEND_API_KEY` vive en las variables de entorno de Convex en vez de en el worker de Cloudflare,
y si el correo falla la solicitud ya quedó guardada de todos modos — hoy, si Resend falla, la
solicitud **se pierde por completo**, porque no se persiste en ningún lado.

### Sobre el correo en esta fase

El dominio `ieee-estl.com` todavía no está configurado y el destinatario no está definido, así
que **esta fase no toca ni el remitente ni los destinatarios**: se muda la lógica de envío tal
cual está a la `action`, y el cambio de dominio/correo queda para la **Fase 7**.

Lo que sí se prepara aquí, para que la Fase 7 sea un cambio de configuración y no de código:

- **Destinatarios desde variable de entorno.** Hoy están hardcodeados tres correos personales en
  `route.ts` (`paulo.mantilla@ieee.org`, `mariolozano@ieee.org`, `lgmalkih@gmail.com`) — y dos de
  esas personas ya no están en la mesa directiva según los cambios de contenido pendientes. Se
  leen de `JOIN_REQUEST_RECIPIENTS`, con los valores actuales como default provisional. Así, la
  próxima mesa directiva cambia el destinatario sin editar código ni desplegar.
- **Remitente desde variable de entorno** (`JOIN_REQUEST_FROM`), mismo motivo.
- **Escapado de la plantilla.** Los datos del formulario hoy se interpolan **crudos** en el HTML
  del correo, lo que permite inyectar marcado desde el campo "razón para unirse". Se escapan al
  construir la plantilla.

### Cambios

- `convex/workshops.ts`, `convex/events.ts` — `mutation` de inserción con validación en servidor.
- `convex/joinRequests.ts` — `mutation` interna de inserción + `action` que inserta y envía correo.
- `registration-form.tsx` y `registration-event-form.tsx` — reemplazar las llamadas a Supabase.
- `JoinDialog.tsx` — reemplazar el `fetch('/api/send')` por `useAction`, y sustituir los `alert()`
  actuales por retroalimentación dentro del diálogo (estado de éxito/error).
- Eliminar `src/config/supabaseClient.ts` y `src/app/api/send/route.ts` (su lógica se muda a la
  `action`).
- Desinstalar `@supabase/supabase-js` y `@react-email/render` *(este último está instalado pero
  no se usa en ninguna parte del código actual)*. **`resend` se queda.**
- Retirar `NEXT_PUBLIC_SUPABASE_*` del entorno local y de Cloudflare; mover `RESEND_API_KEY` a
  las variables de entorno de Convex.

### Commits sugeridos

1. `feat(convex): add mutations for workshop and event registrations`
   → `convex/workshops.ts`, `convex/events.ts`
2. `refactor(forms): submit workshop and event registrations through convex`
   → `src/components/registration-form.tsx`, `src/components/registration-event-form.tsx`
3. `feat(convex): add join request action that persists and notifies`
   → `convex/joinRequests.ts`
4. `feat(email): move resend notification into convex action with escaped template`
   → `convex/joinRequests.ts`, `convex/emails/joinRequest.ts`
5. `refactor(forms): submit join request through convex action`
   → `src/components/JoinDialog.tsx`
6. `refactor(forms): replace alert() feedback with inline UI states`
   → `src/components/JoinDialog.tsx`
7. `chore: remove supabase client and legacy send route`
   → `src/config/supabaseClient.ts`, `src/app/api/send/route.ts`
8. `chore(deps): drop supabase and unused react-email`
   → `package.json`, `bun.lock`

### Efecto sobre el build

Al eliminar `supabaseClient.ts` y `/api/send/route.ts` desaparecen las lecturas de `process.env`
de Supabase y Resend, que impedían compilar.

**Corrección a lo que decía antes este documento:** afirmé que a partir de esta fase el build
funcionaría "en un clon limpio sin configurar nada". Es falso, y se verificó. El build sigue
exigiendo `NEXT_PUBLIC_CONVEX_URL`, porque `ConvexClientProvider` la necesita y Next incrusta las
variables `NEXT_PUBLIC_*` en tiempo de build.

La diferencia real es otra, y sí importa:

- **Antes:** el build fallaba por una integración muerta, con un mensaje críptico
  (`supabaseUrl is required`) y ninguna forma de saber qué variable faltaba ni de dónde sacarla.
- **Ahora:** falla por una dependencia viva, con un mensaje que dice qué correr
  (`Falta NEXT_PUBLIC_CONVEX_URL. Corre bunx convex dev...`), y la variable se regenera sola
  contra la cuenta de Convex.

Se dejó a propósito que falle fuerte en lugar de compilar y producir un sitio que no guarda nada.
Para desplegar en Cloudflare hay que cargar `NEXT_PUBLIC_CONVEX_URL` en el entorno de build.

### Lo que necesito de ti

- La **API key de la cuenta nueva de Resend** — no me la pegues en el chat: la cargas tú con
  `bunx convex env set RESEND_API_KEY <valor>` cuando lleguemos a este punto.

> Si al llegar a esta fase la cuenta de Resend todavía no existe, la fase se puede construir
> completa igual: la `action` queda escrita y la persistencia en Convex funciona. Solo el envío
> del correo quedaría inactivo hasta la Fase 7.

> **Nota:** mientras `ieee-estl.com` no esté verificado en Resend, el envío fallará en producción
> aunque el código esté correcto. Para probar esta fase se puede usar la dirección de pruebas
> `onboarding@resend.dev` como remitente. La persistencia en Convex funciona desde el primer
> momento, independientemente del correo.

---

## Fase 4 — Nueva sección "Queremos Conocerte"

**Rama sugerida:** `feat/queremos-conocerte`

### Propósito

Formulario interactivo en el Home para recopilar los intereses de los estudiantes y planear
talleres y pláticas futuras con base en datos reales, no en suposiciones.

### Banco de preguntas

**1. Datos de identificación** — *"Primero, cuéntanos sobre ti. Queremos saber a quién estamos escuchando."*

- Nombre completo *(texto)*
- Grupo / Semestre *(texto)*

**2. Intereses tecnológicos** — *"¿Qué área te emociona más?"* *(selección múltiple)*

Inteligencia Artificial · Videojuegos · Ciberseguridad · Desarrollo Móvil · Desarrollo Web ·
Diseño UI/UX · Backend · Análisis de Datos · Bases de Datos

**3. Nivel de experiencia** — *"¿Qué tanto has programado?"* *(selección única)*

Empezando · Intermedio · Avanzado

**4. Formato de eventos** — *"¿Qué tipo de evento sí te haría quedarte después de clases?"* *(selección múltiple)*

Talleres prácticos · Charlas de expertos · Reuniones sociales / Networking · Hackathons / Competencias

**5. Curiosidad por la industria** — *"¿Qué industria te da más curiosidad?"* *(selección múltiple)*

Gaming · Enterprise Software · Media/Streaming · Hardware/IoT · Fintech · Cloud · Open Source ·
E-Commerce · Tecnologías Comunitarias · Data Science/AI

**6. Meta del semestre** — *"¿Qué te mueres por aprender este semestre?"* *(texto libre)*

### Decisiones de diseño

- **Formato:** multi-paso (una pregunta por pantalla con barra de progreso), no un formulario
  largo de scroll. Es el patrón que mejor sostiene la tasa de finalización en encuestas de seis
  bloques, y encaja con el carácter "interactivo" que pediste.
- **Sin contacto — decidido.** Sin email ni teléfono, tal como está el banco de preguntas. Menos
  fricción y más respuestas, a cambio de no poder contactar a quien responde. Las respuestas se
  analizan en agregado desde el dashboard.

### Cómo se evitan las respuestas duplicadas

Corrijo algo que dije antes: llamé "anónimo" a este formulario, pero **el bloque 1 sí pide nombre
completo y grupo/semestre**. No hay contacto, pero sí identidad. Eso cambia lo que se puede hacer
contra duplicados: no dependemos solo de `localStorage`, hay una barrera real del lado del
servidor.

**Barrera 1 — `localStorage` (cliente).** Al enviar, se guarda una marca en el navegador. Si la
persona vuelve al home, ve un estado de "ya respondiste, gracias" en vez del formulario. Evita el
duplicado accidental — el más común: enviar dos veces por no ver la confirmación. Se sortea con
otro navegador o modo incógnito, así que no es la barrera de fondo.

**Barrera 2 — verificación en el servidor (la que cuenta).** La `mutation` de Convex normaliza
`nombreCompleto` + `grupoSemestre` (minúsculas, sin acentos, espacios colapsados), busca por un
índice sobre esa clave y rechaza el envío si ya existe. Un mismo alumno no puede registrar dos
respuestas aunque cambie de navegador.

**Barrera 3 — el botón se deshabilita durante el envío**, para el doble clic.

**Límite honesto:** dos alumnos distintos con el mismo nombre en el mismo grupo se bloquearían
entre sí, y quien quiera insistir puede escribir su nombre distinto. Sin identidad verificada
(correo institucional) no hay forma de cerrarlo del todo. Para el propósito — planear talleres
con base en tendencias — es más que suficiente, y el mensaje de rechazo será claro para que quien
se topa con él sepa por qué.
- **Stack:** `react-hook-form` + `zod` (ya instalados y ya usados en `JoinDialog`), componentes
  shadcn/ui existentes, animación entre pasos con `motion`, envío vía mutation de Convex.
- **Ubicación en el home:** entre `Inicio` y `Unete`.

### Commits sugeridos

1. `convex: mutation de studentInterests con rechazo de duplicados`
   → `convex/studentInterests.ts` *(el esquema y su índice ya quedaron en la Fase 2)*
3. `feat(home): add QueremosConocerte multi-step form component`
   → `src/components/QueremosConocerte.tsx`
4. `feat(home): persist answered state in localStorage`
   → `src/components/QueremosConocerte.tsx`
5. `feat(home): mount QueremosConocerte section on landing page`
   → `src/app/page.tsx`
6. `feat(ui): add progress and checkbox primitives` *(solo si shadcn requiere componentes nuevos)*

### Lo que necesito de ti

- Nada pendiente. Fase lista para construirse.

---

## Fase 5 — Páginas propias para Events y ComingSoon

**Rama sugerida:** `feat/events-pages`

### Alcance

Hoy `Events` (340 líneas) y `ComingSoon` (279 líneas) están comentados en el Home, y el Navbar
sigue enlazando a `/#events` y `/#coming-soon` — anclas que ya no existen en el DOM: son enlaces
rotos en producción **en este momento**.

### Cambios

- Nueva ruta `/events` — historial completo de eventos pasados, usando el componente `Events`.
- Nueva ruta `/coming-soon` — página dedicada a próximos eventos, usando `ComingSoon`.
- **`ComingSoon` en el Home es condicional:** se renderiza solo si hay eventos próximos. Hoy su
  arreglo `cards` está vacío (`const cards: Card[] = []`), así que la sección simplemente no
  aparece hasta que se agregue el primero.
- Extraer los datos de eventos de dentro de los componentes a `src/app/data/events.ts` y
  `src/app/data/comingSoon.ts`, siguiendo el patrón ya establecido por `members.ts`. Esto es lo
  que permite la condicional del punto anterior y facilita que futuras generaciones agreguen
  eventos sin tocar JSX.
- Actualizar el Navbar: `/#events` → `/events`, `/#coming-soon` → `/coming-soon`.
- Metadata (`title`, `description`) por página.

### Commits sugeridos

1. `refactor(events): extract events and coming-soon data to data modules`
   → `src/app/data/events.ts`, `src/app/data/comingSoon.ts`, `src/components/Events.tsx`, `src/components/ComingSoon.tsx`
2. `feat(events): add dedicated /events page`
   → `src/app/events/page.tsx`
3. `feat(events): add dedicated /coming-soon page`
   → `src/app/coming-soon/page.tsx`
4. `feat(home): render ComingSoon on landing only when upcoming events exist`
   → `src/app/page.tsx`
5. `fix(navbar): point events and coming-soon links to their own routes`
   → `src/components/Navbar.tsx`

### Lo que necesito de ti

- ¿Los eventos siguen siendo datos hardcodeados en el repo, o también deben vivir en Convex para
  poder administrarlos desde el dashboard? *(Recomendación: hardcodeados por ahora — son
  contenido editorial de baja frecuencia y así se mantiene el sitio como plantilla reutilizable
  para otras ramas, que es el propósito declarado en el README.)*

---

## Fase 6 — Dashboard administrativo privado

**Rama sugerida:** `feat/admin-dashboard`

### Propósito

Ruta privada y oculta en `/dashboard`, de uso exclusivo del equipo, que consume los datos de
Convex y muestra todas las respuestas recopiladas de los formularios.

### Requerimientos

- **Data Tables** limpias y estructuradas: ordenamiento por columna, búsqueda, paginación.
- **Navegación por pestañas** para alternar entre los cuatro formularios: `Queremos Conocerte` ·
  `Únete a la rama` · `Talleres` · `Eventos`.
- **Oculta:** sin enlace en el Navbar, `noindex` en la metadata y `Disallow: /dashboard` en
  `robots.txt`.
- **Reactiva:** al ser `query` de Convex, las respuestas nuevas aparecen sin recargar.
- **Solo lectura — decidido.** No se expone ninguna `mutation` de borrado ni de edición desde el
  dashboard. Si alguna vez hay que borrar un registro, se hace desde el panel de Convex, que
  requiere entrar con la cuenta dueña del proyecto.
- Exportación a CSV por tabla *(propuesta — confírmame si la quieres)*.

### Autenticación — decidido: Convex Auth, cuenta única

`@convex-dev/auth` con proveedor de contraseña. **Una sola cuenta** para todo el equipo, con
credenciales que no salen de él. Sin botón de iniciar sesión en el Navbar (ya se removió en la
Fase 1): el único acceso es escribir `/dashboard` directamente, que muestra la pantalla de
inicio de sesión.

**Lo crítico de esta fase:** el proveedor de contraseña de Convex Auth **permite auto-registro
por defecto**. Si se deja tal cual, cualquiera que llegue a `/dashboard` puede crearse una cuenta
y leer todas las respuestas de los estudiantes. Hay que:

1. Exponer únicamente el flujo `signIn` en la UI — nunca un formulario de alta.
2. Bloquear el alta en el servidor, no solo esconder el botón: la `action` de Convex Auth rechaza
   cualquier intento de `signUp` una vez que la cuenta del equipo existe. Esconder el botón no es
   protección; el endpoint sigue siendo alcanzable.
3. Crear la cuenta del equipo **una sola vez**, antes de aplicar el bloqueo.

Cómo se crea esa cuenta única: habilitamos el alta temporalmente, tú te registras con el correo y
contraseña que el equipo va a usar, y acto seguido aplicamos el bloqueo. Es el paso donde más
cuidado hay que tener con el orden, y lo hacemos juntos.

**Además:** con una cuenta compartida, quien tenga la contraseña la tiene para siempre — no hay
forma de revocarle el acceso a una persona sin cambiarla para todos. Vale la pena acordar desde
ahora quién la custodia.

### Commits sugeridos

1. `chore(deps): add @convex-dev/auth and tanstack table`
   → `package.json`, `bun.lock`
2. `feat(auth): configure convex auth with password provider`
   → `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `convex/schema.ts`
3. `feat(auth): disable self sign-up and allow sign-in only`
   → `convex/auth.ts`
4. `feat(dashboard): add protected route shell and sign-in screen`
   → `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/middleware.ts`
5. `feat(convex): add authenticated admin queries for all form submissions`
   → `convex/admin.ts`
6. `feat(dashboard): add reusable DataTable component`
   → `src/components/dashboard/DataTable.tsx`, `src/components/ui/table.tsx`
7. `feat(dashboard): add tabbed views for the four form datasets`
   → `src/components/dashboard/*`
8. `chore(seo): exclude /dashboard from indexing`
   → `src/app/robots.ts`, metadata

> Las `query` de `convex/admin.ts` deben verificar la sesión **dentro de la función**, no solo
> confiar en que el middleware bloquee la ruta. Las funciones de Convex son alcanzables por su
> propia URL, independientemente de lo que haga Next.js.

### Lo que necesito de ti

- El **correo y contraseña** con los que se creará la cuenta única del equipo — no me los pegues
  en el chat: los tecleas tú en la pantalla de registro durante el paso descrito arriba.
- ¿Se necesita exportar a CSV?

---

## Fase 7 — Dominio y correo de Resend

**Rama sugerida:** `feat/resend-domain-update`

### Por qué va al final

Es la única fase que depende de algo fuera del código: que `ieee-estl.com` termine de
configurarse y que la mesa directiva defina a qué correo deben llegar las solicitudes. Si esas
dos cosas se resuelven antes, la fase puede adelantarse sin afectar a ninguna otra.

Gracias al trabajo hecho en la Fase 3, esto ya **no es un cambio de código**: los valores viven
en variables de entorno de Convex.

### Cambios

1. Verificar `ieee-estl.com` en el panel de Resend (agregar los registros DNS que Resend indique
   y esperar la propagación).
2. `bunx convex env set JOIN_REQUEST_FROM "IEEE Student Branch - ESTl <noreply@ieee-estl.com>"`
3. `bunx convex env set JOIN_REQUEST_RECIPIENTS "<correo definido>"`
4. Enviar una solicitud de prueba y confirmar que llega.
5. Quitar del código los valores default provisionales, que a esa altura ya son correos de
   personas fuera de la mesa directiva.

### Commit sugerido

1. `chore(email): drop provisional default recipients now set via env`
   → `convex/emails/joinRequest.ts`

### Lo que necesito de ti

- Aviso de que el dominio quedó configurado.
- El correo destinatario definitivo.

---

## Pendientes técnicos detectados (fuera del alcance acordado)

No forman parte de las implementaciones solicitadas. Los dejo registrados para decidir después si
entran como fase propia:

- `bun lint` está roto: no existe `eslint.config.mjs` ni la dependencia de ESLint.
- Dos componentes distintos exportan el mismo nombre `RegistrationForm`, lo que confunde al
  importarlos.
- `/register-event` está cerrado por hardcode (`useState(true)` en `isRegistrationClosed`): abrir
  o cerrar el registro requiere editar y desplegar código.
- Import sin usar `import { date } from 'zod'` en `src/app/data/members.ts`.
- Import sin usar de `r2IncrementalCache` en `open-next.config.ts`.
- Assets sin usar en `public/`: `next.svg`, `vercel.svg`, `window.svg`, `file.svg`, `globe.svg`.
- No existe `.env.example` que documente las variables necesarias para levantar el proyecto.
- No hay tests ni CI.

---

## Cambios pendientes sin commitear (previos a este plan)

El working tree de `dev` tiene una actualización de la mesa directiva 2026 sin commitear: Mario
Lozano pasa a "Iconos", Iván Rojo a presidente, entra Martín Hernández como secretario, Malkhi
pasa a diseñadora, se elimina `roberto.webp` y se renombra "Ex-Miembros" → "Iconos".

`src/assets/memberImages/martin.webp` está **sin trackear**: falta el `git add`, y sin él el
build falla en cualquier clon limpio.

**Recomendación:** cerrar esto en un commit propio sobre `dev` antes de abrir `feat/remove-clerk`.

```
chore(content): update 2026 board members and rename Ex-Miembros to Iconos
→ src/app/data/members.ts, src/app/data/exMembers.ts, src/app/members/page.tsx,
  src/assets/memberImages/martin.webp, src/assets/memberImages/roberto.webp (eliminado),
  src/app/favicon.ico, .gitignore
```
