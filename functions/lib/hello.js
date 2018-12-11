"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_functions_1 = require("firebase-functions");
exports.helloWorld = firebase_functions_1.https.onRequest((request, response) => {
    response.send("Hello from firebase");
});
//# sourceMappingURL=hello.js.map