const express = require("express");
const bodyParser = require("body-parser");
const database = require("./config/database");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

database.connect();

const routesApiV1 = require("./api/v1/routes/index.route");

// parse application/json
app.use(bodyParser.json());

routesApiV1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
