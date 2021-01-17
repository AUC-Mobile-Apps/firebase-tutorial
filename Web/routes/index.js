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

let registry = {};

// Register Token
router.use("/register_notification_token", FirebaseAuthentication);
router.post("/register_notification_token", function (req, res) {
    let token = req.body.fcmToken;

    console.log(req.user.uid + " registered a device with token " + token);

    // You might want to add it to the database or something here. :)

    // Storing things in an object won't work long-term because the object
    // is in RAM and will be gone as soon as the server restarts.

    // Additionally, never use anything other than the UID to store a user's info
    // in your database. Emails, phone numbers and names can all change.

    registry[req.user.uid] = token;

    return res.status(200).send("ok");
});

// Get Notification
router.use("/send_test_notification", FirebaseAuthentication);
router.post("/send_test_notification", function(req, res) {
    let token = registry[req.user.uid];
    if (token === null || token === undefined) {
        return res.status(400).send("not registered");
    }

    console.log("Sending to token " + token);
    
    const message = {
        notification: {
            title: 'Your Request Notification',
            body: 'Hi (:'
        },
        token: token
    };

    FirebaseApp.messaging().sendAll(
        [message] // You can send multiple messages at the same time.
    ).then(result=> {
        console.log("Message sent successfully.");
        return res.status(200).send("ok");
    }).catch(err=> {
        console.error("Message failed to send:");
        console.error(err);
        return res.status(500).send("Internal Server Error");
    })
})

// Export the created router
module.exports = router;
