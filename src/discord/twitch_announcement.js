const Discord = require("discord.js");
const Emitter = require("events");

const twitch = require("../twitch/twitch.js");
const channels = require("../discord/channels.js");

const config = require("../../config.json");
let isOnline = false; //TODO ONLY FOR ONE STREAMER!

module.exports = {
    startCheckStreamStatus: startCheckStreamStatus,
    checkStreamStatus: checkStreamStatus
}

/**
 * Checks if stream is online and posts announcement when it is the case
 *
 * @async
 */
async function checkStreamStatus() {
    let { isNowOnline, response } = await twitch.isStreamOnline({
        login: 'princesspaperplane'
    });

    if (!isNowOnline) {
        //princess not online
        if (isOnline) {
            console.log("PrincessPaperplane ist offline gegangen!");
            console.log(response);
            isOnline = false;
        }
    } else {
        //When princess is online for the first time since last API call
        if (!isOnline) {
            console.log("PrincessPaperplane ist online gegangen!");
            console.log(response);
            isOnline = true;

            announceStream(response);
        }
    }
}

/**
 * Starts regular online status updates for streamers
 *
 * @returns {NodeJS.Timeout} coroutineID ID of running coroutine
 */
function startCheckStreamStatus() {

    global._twitchEmitter = new

    let coroutineID;    
    console.log("Now updating twitch stream statusses");

    if (process.argv.includes("--announceonce")) { //--once denotes one time test of function
        console.log("Testing once");
    } else {
        coroutineID = setInterval(twitchAnnouncement.checkStreamOnline, config.twitch.twitchStreamStatusUpdateInterval);
    }
    
    checkStreamStatus();
    return coroutineID;
}

/**
 *  Announces stream in channel by providing link and a message
 *
 * @param {Object} response
 */
function announceStream(response) {
    let streamerURL = `https://www.twitch.tv/${response.data.data[0].user_name}`;
    let message = config.discord.announceMessage;
    
    channels.applyToChannels(config.discord.announceChannelIDs, channel => {
        channel.send(message + streamerURL);
    });
}