const express = require("express");
const database = require("./config/database");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

database.connect();

const routesApiV1 = require("./api/v1/routes/index.route");
routesApiV1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
