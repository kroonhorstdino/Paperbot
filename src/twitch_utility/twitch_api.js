/** 
 * Provides interface with Twitch Helix API
 */

const axios = require("axios");
const config = require("../../config.json");

module.exports = {
    fetchUserData: fetchUserData,
    fetchStreamData: fetchStreamData
}

/**
 * 
 * @param {*} param0 
 */
async function fetchUserData(params, callback)
{
    let request = 'users'; //API endpoint for twitch

    //If ID is given use the ID
    if (params.id) {
        request = addParam(request, ["id", params.id]);
      
    } else if (params.login) { //When only name is given, use the name
        request = addParam(request, ["login", params.login]);
    } else {
        throw new Error('No identifier for user given (e.g. user_id or user_login)');
    }

    return await fetchData(request, callback);
}

/** 
 * 
 * @param {Object} params
 * @callback callback
*/
async function fetchStreamData(params, callback)
{
    let request = 'streams'; //API endpoint for twitch

    //If ID is given use the ID
    if (params.id) {
        request = addParam(request, ["user_id", params.id]);
    } else if (params.login) { //When only name is given, use the name
        request = addParam(request, ["user_login", params.login]);
    } else {
        throw new Error('No identifier for user given (e.g. id or login)');
    }

    return await fetchData(request, callback);
}

/**
 *
 * 
 * Callback for handling API response from Twitch
 * @param {string} request Request string for Twitch API
 * @callback callback function to handle response from twitch
 */
async function fetchData(
    request,
    callback
) {
    const clientID = config.twitch.clientID.toString();
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
    } else {
        throw new Error('No callback given');
    }
}

/**
 * Add parameter to existing request string
 * @param {String} request 
 * @param {Array} param Arrays that contain parameter key and value (e.g. user_login and <username>)
 */
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
