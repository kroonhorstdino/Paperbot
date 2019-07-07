const Discord = require("discord.js");
const config = require('../../config.json')

module.exports = {

    /**
     *  Handles twitch command
     *
     * @param {Discord.Message} msg Message by user
     */
    execute: (msg, content) => {
        msg.channel.send("Twitch command placeholder");
    },

    aliases: [
        "tw",
        "twitch",
    ],

    isEnabled: config.enabledCommand.twitch,

    help: () => {},
}