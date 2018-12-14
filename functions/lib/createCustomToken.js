"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const rp = require("request-promise");
// Be sure to set lineChannelid to firebase config.
// e.g. firebase functions:config:set line.channelid=XXXXXXXXXX
const lineChannelid = functions.config().line.channelid;
const runtimeOpts = {
    timeoutSeconds: 300,
};
const baseUrl = 'https://api.line.me';
function generateLineApiRequest(path, lineAccessToken) {
    return {
        url: baseUrl + path,
        headers: {
            'Authorization': `Bearer ${lineAccessToken}`
        },
        json: true,
    };
}
exports.testBasicCreateCustomToken = functions.runWith(runtimeOpts).https
    .onRequest((request, response) => {
    console.info("request.body", request.body);
    console.info("request.body.access_token", request.body.access_token);
    const ret = {
        customToken: "helloShittyAPIthisIsMyFirebaseCustomToken",
    };
    return response.status(200).send(ret);
});
exports.testIntermediateCreateCustomToken = functions.runWith(runtimeOpts).https
    .onRequest((request, response) => {
    console.info("request.body", request.body);
    const token = request.body.access_token;
    if (token === undefined) {
        const ret = {
            error_message: 'access_token not found in request',
        };
        return response.status(400).send(ret);
    }
    return verifyLineToken(token)
        .then((verifyLineTokenResponse) => {
        console.info('verifyLineTokenResponse', verifyLineTokenResponse);
        return fetchLineProfile(token);
    })
        .then((fetchLineProfileResponse) => {
        console.info('fetchLineProfileResponse', fetchLineProfileResponse);
        const ret = {
            customToken: "helloShittyAPIthisIsMyFirebaseCustomToken",
        };
        return response.status(200).send(ret);
    }).catch((err) => {
        console.error(err);
        const ret = {
            error_message: `Authentication error: ${err}`,
        };
        return response.status(403).send(ret);
    });
});
exports.createCustomToken = functions.runWith(runtimeOpts).https
    .onRequest((request, response) => {
    console.info("request.body", request.body);
    const token = request.body.access_token;
    if (token === undefined) {
        const ret = {
            error_message: 'access_token not found in request',
        };
        return response.status(400).send(ret);
    }
    return verifyLineToken(token)
        .then((verifyLineTokenResponse) => {
        console.info('verifyLineTokenResponse', verifyLineTokenResponse);
        return fetchLineProfile(token);
    })
        .then((fetchLineProfileResponse) => {
        console.info('fetchLineProfileResponse', fetchLineProfileResponse);
        return connectToFirebaseUser(fetchLineProfileResponse);
    })
        .then((userRecord) => {
        console.info('userRecord', userRecord);
        return admin.auth().createCustomToken(userRecord.uid);
    })
        .then((customToken) => {
        const ret = {
            customToken: customToken
        };
        return response.status(200).send(ret);
    }).catch((err) => {
        console.error(err);
        const ret = {
            error_message: `Authentication error: ${err}`,
        };
        return response.status(403).send(ret);
    });
});
function verifyLineToken(token) {
    return rp({
        method: 'GET',
        uri: `https://api.line.me/oauth2/v2.1/verify?access_token=${token}`,
        json: true
    }).then((response) => {
        if (response.client_id !== lineChannelid) {
            return Promise.reject(new Error('The provided access token and service LINE channel ID mismatched'));
        }
        return response;
    });
}
function fetchLineProfile(token) {
    const getProfileOptions = generateLineApiRequest('/v2/profile', token);
    return rp(getProfileOptions);
}
function connectToFirebaseUser(fetchLineProfileResponse) {
    if (fetchLineProfileResponse.userId === undefined) {
        return Promise.reject(new Error('LINE profile response does not contain userId'));
    }
    const firebaseUid = `${fetchLineProfileResponse.userId}`;
    return admin.auth().getUser(firebaseUid).then(function (userRecord) {
        return userRecord;
    }).catch((err) => {
        if (err.code === 'auth/user-not-found') {
            const user = {
                uid: firebaseUid
            };
            if (fetchLineProfileResponse.hasOwnProperty('displayName')) {
                user['displayName'] = fetchLineProfileResponse.displayName;
            }
            if (fetchLineProfileResponse.hasOwnProperty('pictureUrl')) {
                user['photoURL'] = fetchLineProfileResponse.pictureUrl;
            }
            return admin.auth().createUser(user);
        }
        return Promise.reject(err);
    });
}
//# sourceMappingURL=createCustomToken.js.map