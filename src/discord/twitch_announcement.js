const Discord = require("discord.js");
let config = require("../../config.json");

const twitch = require("../twitch/twitch.js");
const channels = require("../discord/channels.js");

let isOnline = false; //TODO ONLY FOR ONE STREAMER!

module.exports = {
    checkStreamOnline: checkStreamOnline
}

/**
 *  Checks if stream is online and posts announcement when it is the case
 *
 * @async
 * @param {Discord.Client} client
 */
async function checkStreamOnline(client) {
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

            announceStream(client, response);
        }
    }
}

/**
 *  Announces stream in channel by providing link and a message
 *
 * @param {Discord.Client} client
 * @param {Object} response
 */
function announceStream(client, response) {
    let streamerURL = `https://www.twitch.tv/${response.data.data[0].user_name}`;
    let message = config.discord.announceMessage;
    
    channels.applyToChannels(client, config.discord.announceChannelIDs, channel => {
        channel.send(message + streamerURL);
    });
}