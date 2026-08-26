import { httpRouter } from "convex/server";
import { auth } from "./auth";

// Rutas HTTP que Convex Auth necesita para el intercambio de tokens.
const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
