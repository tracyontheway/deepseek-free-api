/**
 * Vercel Serverless Entry Point
 * This file is placed in the api/ directory for Vercel to recognize it as a serverless function
 */

import environment from "../dist/lib/environment.js";
import config from "../dist/lib/config.js";
import "../dist/lib/initialize.js";
import server from "../dist/lib/server.js";
import routes from "../dist/api/routes/index.js";

// Attach routes to the server
server.attachRoutes(routes);

// Export the Koa callback for Vercel serverless
// The callback signature matches Vercel's expected (req, res) => void format
export default server.app.callback();
