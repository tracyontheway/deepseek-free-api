/**
 * Vercel Serverless Entry Point
 * Exports the Koa app as a serverless function handler for Vercel deployment
 */

import environment from "@/lib/environment.ts";
import config from "@/lib/config.ts";
import "@/lib/initialize.ts";
import server from "@/lib/server.ts";
import routes from "@/api/routes/index.ts";
import logger from "@/lib/logger.ts";

// Attach routes to the server
server.attachRoutes(routes);

// Export the Koa callback for Vercel serverless
export default server.app.callback();
