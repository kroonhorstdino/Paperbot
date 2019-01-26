/** 
 * Provides interface with Twitch Helix API
 */

const axios = require("axios");
const secret = require("../../secret.json");

module.exports = {
    fetchUserData: fetchUserData,
    fetchStreamData: fetchStreamData
}

/**
 * @typedef TwitchResponse
 * @property {Object} data 
 */

/** 
 * Get twtich API data about given user
 * 
 * @async
 * @param {string[]} streamIdentifiers Identifiers for stream (e.g. login or id of twitch user)
 * @param {function (Object): void} callback callback to handle response from twitch
 * @returns {TwitchResponse} Returns reponse when no callback is given
 */
async function fetchUserData(streamIdentifiers, callback) {
    let request = 'users'; //API endpoint for twitch

    //If ID is given use the ID
    if (streamIdentifiers.id) {
        request = addParam(request, ["id", streamIdentifiers.id]);

    } else if (streamIdentifiers.login) { //When only name is given, use the name
        request = addParam(request, ["login", streamIdentifiers.login]);
    } else {
        throw new Error('No identifier for user given (e.g. user_id or user_login)');
    }

    //Use either callback or return response
    if (callback && typeof callback == 'function') {
        return await fetchData(request, callback);
    } else {
        return await fetchData(request);
    }
}

/** 
 * 
 * Get twtich API data about given streamer
 * @async 
 * @param {string[]} streamIdentifiers Identifiers for stream (e.g. login or id of twitch user)
 * @param {function (Object): void} callback callback to handle response from twitch
 */
async function fetchStreamData(streamIdentifiers, callback) {
    let request = 'streams'; //API endpoint for twitch

    //If ID is given use the ID
    if (streamIdentifiers.id) {
        request = addParam(request, ["user_id", streamIdentifiers.id]);
    } else if (streamIdentifiers.login) { //When only name is given, use the name
        request = addParam(request, ["user_login", streamIdentifiers.login]);
    } else {
        throw new Error('No identifier for user given (e.g. id or login)');
    }

    if (callback && typeof callback == 'function') {
        return await fetchData(request, callback);
    } else {
        return await fetchData(request);
    }
}

/**
 *
 * Callback for handling API response from Twitch
 * @async
 * @param {string} request Request string for Twitch API
 * @param {function(Object):void} callback callback to handle response from twitch
 * @returns {Object} If no callback is given, the response is returned
 */
async function fetchData(
    request,
    callback
) {
    const clientID = secret.twitch.clientID.toString();
    const api_endpoint = 'https://api.twitch.tv/helix/' + request;

    let response = await axios.get(api_endpoint, {
        headers: {
            'Client-ID': clientID //Twitch Client-ID
        }
    }).catch(error => {
        console.log(error);
    })

    if (callback && typeof callback == 'function') {
        callback(response);
        return;
    } else {
        return response;
    }
}

/**
 * Add parameter to existing request string
 * @param {String} request 
 * @param {string[]} param Arrays that contain paris of parameter key and value (e.g. name + <name>)
 * @returns {string} Concatinated request string
 * */
function addParam(request, ...param) {

    param.forEach((value) => {
        request += ('?' + value[0] + '=' + value[1]);
    });
    return request;
}

//##########################
/*
fetchStreamData({ login: 'princesspaperplane' }, () => {
    console.log("Hello");
});*/
