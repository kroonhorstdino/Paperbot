const Discord = require("discord.js");
const Emitter = require("events");

const twitch = require("../twitch/twitch.js");
const channels = require("../discord/channels.js");

const config = require("../../config.json");

module.exports = class TwitchAnnouncement {

    constructor() {
        /**
         *
         *@type {Boolean}
        */
        this.isOnline = false;

        /** @type {NodeJS.Timeout} */
        this.currentCheckCoroutine = null;
    }
    
    /**
     * Starts regular online status updates for streamers
     */
    initCheckStreamStatus() {
        console.log("Now updating twitch streamer statusses");

        if (process.argv.includes("--announceonce")) { //--once denotes one time test of function
            console.log("Testing once");
        } else {
            this.startStreamCheckStatus(config.twitch.updateIntervalWhenOffline);
        }
    }

    /**
     * Starts check routine and stores it in instance variable
     * 
     * @private
     * @param {number} udpateInterval
     */
    startStreamCheckStatus(udpateInterval) {
        this.checkStreamStatus();
        this.currentCheckCoroutine = setInterval(this.checkStreamStatus, udpateInterval);
    }

    /**
     * Stops check routine and stores it and clear variable
     *
     * @private
     */
    stopStreamCheckStatus() {
        try {
            clearInterval(this.currentCheckCoroutine);
        } catch (error) {
            console.error(error);
        } finally {
            this.currentCheckCoroutine = -1;
        }
    }

    /**
     * Updates interval of checking routine
     *
     * @param {number} newInterval
     */
    changeStreamCheckStatusInterval(newInterval) {
        this.stopStreamCheckStatus();
        this.startStreamCheckStatus(newInterval);
    }

    /**
     * Checks if stream is online and posts announcement when it is the case
     *
     * @async
     * @private
     */
    async checkStreamStatus() {
        let {
            isNowOnline,
            response
        } = await twitch.isStreamOnline({
            login: 'princesspaperplane'
        });

        if (!isNowOnline) { //Streamer was not online at last check

            if (this.isOnline) { //Went online
                console.log("PrincessPaperplane ist offline gegangen!");
                console.log(response);
                this.isOnline = false;

                this.changeStreamCheckStatusInterval(config.twitch.updateIntervalWhenOnline);
            }
        } else { //When streamer was online at last check
            if (!this.isOnline) { //Went offline
                console.log("PrincessPaperplane ist online gegangen!");
                console.log(response);
                this.isOnline = true;

                await this.announceStream(response);

                this.changeStreamCheckStatusInterval(config.twitch.updateIntervalWhenOffline);
            }
        }
    }

    /**
     *  Announces stream in channel by providing link and a message
     *
     * @async
     * @private
     * @param {Object} response Response given by Twitch API
     */
    async announceStream(response) {
        let streamerURL = `https://www.twitch.tv/${response.data.data[0].user_name}`;
        let message = config.discord.announceMessage;

        await channels.applyToChannels(config.discord.announceChannelIDs, channel => {
            channel.send(message + streamerURL);
        });
    }
}