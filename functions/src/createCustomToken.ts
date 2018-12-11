import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as rp from 'request-promise'

const config = require('../config.json');

const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '2GB'
}

export const createCustomToken = functions.runWith(runtimeOpts).https
    .onRequest((request, response) => {
        if (request.body.token === undefined) {
            const ret = {
                error_message: 'AccessToken not found',
            }
            return response.status(400).send(ret)
        }

        return verifyLineToken(request.body)
            .then((customAuthToken) => {
                const ret = {
                    firebase_token: customAuthToken
                }
                return response.status(200).send(ret)
            }).catch((err) => {
                const ret = {
                    error_message: `Authentication error: ${err}`,
                }
                return response.status(200).send(ret)
            })
    })

function verifyLineToken(requestBody) {
    return rp({
        method: 'GET',
        uri: `https://api.line.me/oauth2/v2.1/verify?access_token=${requestBody.token}`,
        json: true,
    }).then((response) => {
        if (response.client_id !== config.line.channelid) {
            return Promise.reject(new Error('LINE channel ID mismatched'))
        }
        return getFirebaseUser(requestBody)
    }).then((userRecord) => {
        return admin.auth().createCustomToken(userRecord.uid)
    }).then((token) => {
        return token
    })
}

function getFirebaseUser(requestBody) {
    const firebaseUid = `line:${requestBody.id}`
    return admin.auth().getUser(firebaseUid).then(function(userRecord) {
        return userRecord
    }).catch((err) => {
        if (err.code === 'auth/user-not-found') {
            return admin.auth().createUser({
                uid: firebaseUid,
                displayName: requestBody.name,
            })
        }
        return Promise.reject(err)
    })
}
