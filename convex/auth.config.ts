/**
 * Configuracion de Convex Auth.
 *
 * OJO: si este archivo falta o esta mal, la app queda "siempre desconectada"
 * sin lanzar ningun error visible. Es el fallo mas comun al montar Convex Auth,
 * y por eso existe aunque parezca trivial.
 *
 * CONVEX_SITE_URL la provee la plataforma; no hay que declararla a mano.
 */
export default {
    providers: [
        {
            domain: process.env.CONVEX_SITE_URL,
            applicationID: "convex",
        },
    ],
};
