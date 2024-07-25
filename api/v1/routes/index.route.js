const taskRoutes = require("./task.route");
const userRoutes = require("./user.route");

const authMiddleware = require("../middlewares/auth.middleware.js");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + "/tasks", authMiddleware.requireAuth, taskRoutes);

  app.use(version + "/users", userRoutes);
};
