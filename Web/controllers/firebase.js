"use strict";
const FirebaseAdmin = require("firebase-admin");

const FirebaseKey = require("../admin-services.json");

let FirebaseApp = FirebaseAdmin.initializeApp({
    credential: FirebaseAdmin.credential.cert(FirebaseKey)
});

function FirebaseAuthentication(req, res, next) {
    let header = req.headers["authorization"];
    if (!header) {
        return res.status(401).send("Unauthorized");
    }
    let headerParts = header.split(" ");
    let token = headerParts[1];
    return FirebaseApp.auth().verifyIdToken(token).then(decoded=> {
        req.user = decoded;
        return next();
    }).catch(err=> {
        console.error("Error authenticating token " + token + ":");
        console.error(err);
        return res.status(401).send("Unauthorized");
    });
}

// Exporting an object that contains two other objects
module.exports = {
    FirebaseApp,
    FirebaseAuthentication
};