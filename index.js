const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const database = require("./config/database");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

database.connect();
app.use(cookieParser());
const routesApiV1 = require("./api/v1/routes/index.route");

app.use(cors());

// parse application/json
app.use(bodyParser.json());

routesApiV1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
