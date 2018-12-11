import { https } from 'firebase-functions'

export const helloWorld = https.onRequest((request, response) => {
    response.send("Hello from firebase")
})
