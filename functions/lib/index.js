"use strict";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_functions_1 = require("firebase-functions");
const firebase_admin_1 = require("firebase-admin");
// you must set config for line channelID
firebase_admin_1.initializeApp(firebase_functions_1.config().firebase);
const hello_1 = require("./hello");
const createCustomToken_1 = require("./createCustomToken");
module.exports = {
    helloWorld: hello_1.helloWorld,
    createCustomToken: createCustomToken_1.createCustomToken
};
//# sourceMappingURL=index.js.map