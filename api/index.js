// Vercel serverless entry point. Every /api/* request is rewritten here by
// the root vercel.json and forwarded to the shared Express application.
const app = require('../server/server');

module.exports = async (req, res) => {
  // Make sure seeding / DB selection finished before handling a request.
  await app.ready;
  return app(req, res);
};
