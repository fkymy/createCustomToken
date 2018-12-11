// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

import { config } from 'firebase-functions'
import { initializeApp } from 'firebase-admin'

// you must set config for line channelID
initializeApp(config().firebase)

import { helloWorld } from './hello'
import { createCustomToken } from './createCustomToken'

module.exports = {
    helloWorld,
    createCustomToken
}
