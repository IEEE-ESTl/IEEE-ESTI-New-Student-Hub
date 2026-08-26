import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

/**
 * Autenticacion del dashboard administrativo.
 *
 * El equipo usa UNA sola cuenta, cuyas credenciales no salen de la mesa
 * directiva. No hay registro publico.
 *
 * ---
 *
 * POR QUE ESTE BLOQUEO EXISTE
 *
 * El proveedor de contrasena de Convex Auth permite auto-registro por defecto.
 * Sin este control, cualquiera que descubriera /dashboard podria crearse una
 * cuenta y leer todas las respuestas de los estudiantes.
 *
 * Esconder el formulario de registro en la interfaz NO es proteccion: el
 * endpoint de Convex Auth sigue siendo alcanzable desde fuera del navegador.
 * El rechazo tiene que ocurrir aqui, en el servidor.
 *
 * `profile` se ejecuta en todos los flujos ("signUp", "signIn", "reset", ...),
 * asi que es el lugar correcto para distinguirlos.
 *
 * ---
 *
 * COMO CREAR O RECUPERAR LA CUENTA DEL EQUIPO
 *
 * El alta se controla con una variable de entorno de Convex, no con una
 * constante en el codigo: asi no hace falta editar ni desplegar nada.
 *
 *   1. bunx convex env set PERMITIR_ALTA_ADMIN true
 *   2. Entrar a /dashboard y registrar la cuenta (una sola vez).
 *   3. bunx convex env remove PERMITIR_ALTA_ADMIN
 *
 * El paso 3 no es opcional. Mientras la variable exista, el alta esta abierta.
 */
const altaHabilitada = () => process.env.PERMITIR_ALTA_ADMIN === "true";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Password({
            profile(params) {
                if (params.flow === "signUp" && !altaHabilitada()) {
                    throw new ConvexError(
                        "El registro esta deshabilitado. Este panel es de uso interno.",
                    );
                }

                const email = String(params.email ?? "").trim().toLowerCase();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    throw new ConvexError("El correo no es valido.");
                }

                return { email };
            },
        }),
    ],
});
