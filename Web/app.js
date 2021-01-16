// Import the created router
const routes = require("./routes/index.js");

const express = require("express");
const morgan = require("morgan");

const port = 3000;
const app = express();

// CORS
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

// Logger
app.use(morgan(':method :url :status - :response-time ms'));

// Routes
app.use("/", routes);

app.listen(port, function () {
    console.log(`Server listening on http://localhost:${port}.`);
    console.log(`You can visit http://localhost:${port}/health in your browser as a preliminary test.`);
});