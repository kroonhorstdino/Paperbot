const chalk = require("chalk");
const twitch_api = require("./twitch_api.js");
const Database = require('../db/database.js');

module.exports = {
    updateOnlineStreams: updateOnlineStreams
}

/**
 * @typedef {Object} isStreamOnlineReturn
 * @property {Boolean} isNowOnline Is the stream online?
 * @property {Object} response Reponse given by twitch API
 */

/**
 * Gets streams that went online since last update and updates database
 * 
 * @async 
 */
async function updateOnlineStreams() {

    Database.connect();

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

    let localStreamersData = await Database.getAnnouncementStreamersStatus();
    let streamers_user_login = [];

    let changedStreamerData = []; //Data to update database
    let newOnlineStreamers = []; //Data for annoucement method ["name", "name"]
    
    //Put only names in array to send to twitch API
    localStreamersData.forEach(pair => {
        streamers_user_login.push(pair.user_login);
    })

    let twitchRes = await twitch_api.fetchStreamData(streamers_user_login); //Get all streams that are online

    //Go through all streamers in the database
    for(let localStreamer of localStreamersData) {
        let streamerIsOnline = false;
        
        //Go through all online streams
        for (let onlineStreamerData of twitchRes.data.data) {
            //Stream went online or is still online
            if (localStreamer.user_login == (onlineStreamerData.user_name).toLowerCase()) {
                streamerIsOnline = true; //Stream is online

                if (localStreamer.isOnline == false) { //Stream went online since last update
                    changedStreamerData.push({
                        user_login: localStreamer.user_login,
                        isOnline: true
                    }); //Document change to online status
                    newOnlineStreamers.push({
                        user_login: localStreamer.user_login,
                        onlineStreamerData: onlineStreamerData
                    })
                }
                continue;
            }
        }

        //When stream was not found but is still locally shown as online
        if (!streamerIsOnline && localStreamer.isOnline) {
            changedStreamerData.push({
                user_login: localStreamer.user_login,
                isOnline: false
            }); //Document change to offline status
        }
    }

    changedStreamerData.forEach(changedStreamerData => {
        Database.updateOnlineStatus(changedStreamerData);
    });

    console.log(`Status updated at: ${date.toLocaleDateString('de-DE', options)}`);

    //Return new streams with data
    return newOnlineStreamers;
}

/*
Database.connect();
updateOnlineStreams();*/


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