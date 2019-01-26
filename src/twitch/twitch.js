const chalk = require("chalk");
const twitch_api = require("./twitch_api.js");

module.exports = {
    isStreamOnline: isStreamOnline
}

/**
 * @typedef {Object} isStreamOnlineReturn
 * @property {Boolean} isNowOnline Is the stream online?
 * @property {Object} response Reponse given by twitch API
 */

/**
 * Checks if stream is online
 * 
 * @async 
 * @param {Object} streamIdentifiers Possible identifiers for stream
 * @param {string} streamIdentifiers.login Login name of streamer
 * @param {string} streamIdentifiers.id ID of streamer
 * @returns {Boolean, Object} If stream is online or not and the API response
 */
async function isStreamOnline(streamIdentifiers) {

    let isNowOnline = false;

    let date = new Date(Date.now());
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: 'h24',
    };

    console.log(`Status checked at: ${date.toLocaleDateString('de-DE', options)}`);

    let response = await twitch_api.fetchStreamData(streamIdentifiers);

    //When data is empty, there is no stream online
    if (response.data.data.length == 0) {
        //not online
        isNowOnline = false;
    } else {
        isNowOnline = true;
    }

    return {isNowOnline, response};
}

/*
function testTwitchOnline() {
    twitch_api.fetchStreamData({
        login: 'sovietwomble'
    }).then(response => {
        console.log(response);
        handleTestResponse(response);
    });
}

function handleTestResponse( response) {

    let date = new Date(Date.now());
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hourCycle: 'h24',
    };

    console.log("Status checked at: " + date.toLocaleDateString('de-DE', options) + ", " + date.getHours() + ":" + date.getMinutes());

    //When data is empty, there is no stream online
    if (response.data.data.length == 0) {
        //princess not online
        if (isPrincessOnline) {
            console.log("PrincessPaperplane ist offline gegangen!");
            console.log(response);
            isPrincessOnline = false;

            channels.applyToChannels(config.discord.announceChannelIDs, channel => {
                channel.send("Test");
            });
        }
    } else {
        //When princess is online for the first time since last API call
        if (!isPrincessOnline) {
            console.log("PrincessPaperplane ist online gegangen!");
            console.log(response);
            isPrincessOnline = true;
        }
    }
}*/
