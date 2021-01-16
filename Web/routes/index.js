const fb = require("../controllers/firebase");

const FirebaseApp = fb.FirebaseApp;
const FirebaseAuthentication = fb.FirebaseAuthentication;

const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();

// Data Helpers
router.use(bodyParser.json()); // Automatically parse all POSTs as JSON.
router.use(bodyParser.urlencoded({ extended: true })); // Automatically parse URL parameters

// Unauthenticated request example
router.get("/health", function (req, res) {
    return res.send("ok");
});

// Authenticated request example:
// All you need to do is add this line first:
router.use("/add", FirebaseAuthentication);

// Then implement your API normally.
router.post("/add", function (req, res) {
    console.log(req.user);
    let body = req.body;
    let num1 = body.num1;
    let num2 = body.num2;

    let result = num1 + num2;

    console.log(req.user.name + " requested an addition on " + num1 + " and " + num2 + ".");

    return res.json({ result: result });
});

// Export the created router
module.exports = router;
