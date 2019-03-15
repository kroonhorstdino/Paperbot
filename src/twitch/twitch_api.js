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
    let requestParams = [];

    if (streamIdentifiers.length < 1) {
        throw new Error('No users given');
    }

    //Add login to streamer names so request can be built properly
    streamIdentifiers.forEach(streamer => {
        requestParams[requestParams.length] = ["user_login", streamer];
        // --> [["login","princesspaperplane"],["login","dirtymerry"]]
    });

    request = addParam(request, requestParams);

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
 * @param {string[]} streamIdentifiers Identifiers for stream (["name","anothername"])
 * @param {function (Object): void} callback callback to handle response from twitch
 */
async function fetchStreamData(streamIdentifiers, callback) {
    let request = 'streams'; //API endpoint for twitch
    let requestParams = [];

     if (streamIdentifiers.length < 1) {
         throw new Error('No users given');
    }

    //Add login to streamer names so request can be built properly
    streamIdentifiers.forEach(streamer => {
        requestParams[requestParams.length] = ["user_login", streamer];
        // --> [["login","princesspaperplane"],["login","dirtymerry"]]
    });

     request = addParam(request, requestParams);

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
 * @param {Object[][]} param Arrays that contain paris of parameter key and value ([[key1,value1],[key2,value2]])
 * @returns {string} Concatinated request string
 * */
function addParam(request, param) {
    
    request += `?${param[0][0]}=${param[0][1]}`; //First symbol has to be '?'
    for (let i = 1; i < param.length; i++) { //After that each addition has a leading '&'
        request += `&${param[i][0]}=${param[i][1]}`; //e.g. streams?user_login=aspen        
    }

    return request; //Should be something like api.twitch/helix/streams?user_login=xxxx?user_login=xxxxx
}

//##########################

/*let a = fetchStreamData(["dirtymerry", "budgetmonk119", "xqcow"]);
a.then(result => {
    console.log(result);
})*/
