const chalk = require("chalk");
const autoBind = require('auto-bind');

const Discord = require("discord.js");
const Emitter = require("events");

const twitch = require("../twitch/twitch.js");
const channels = require("../discord/channels.js");

const config = require("../../config.json");

class TwitchAnnouncement {

    constructor() {
        autoBind(this);

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
            this.checkStreamStatus();
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

        let newOnlineStreamers = await twitch.updateOnlineStreams();

        for (let streamerData of newOnlineStreamers) {
            await this.announceStream(streamerData);
        }
    }

    /**
     *  Announces stream in channel by providing link and a message
     *
     * @async
     * @private
     * @param {Object} response Response given by Twitch API
     */
    async announceStream({ user_login, onlineStreamerData }) {
        console.log(`Announcing ${user_login}`);

        let streamerURL = `https://www.twitch.tv/${user_login}`;
        let message = config.discord.announceMessage;
        message = message.replace(/%user_name/gi, onlineStreamerData.user_name);

        await channels.applyToChannels(config.discord.announceChannelIDs, channel => {
            channel.send(message + " " + streamerURL);
        });
    }
}

/*
let a = new TwitchAnnouncement();
let b = () => { a.checkStreamStatus(); }
b();*/

module.exports = TwitchAnnouncement;