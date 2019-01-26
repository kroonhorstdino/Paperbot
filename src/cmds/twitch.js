const Discord = require("discord.js");

module.exports = {

    /**
     *  Handles twitch command
     *
     * @param {Discord.Message} msg Message by user
     */
    execute: (msg) => {
        msg.channel.send("Twitch command placeholder");
    },

    aliases: [
        "tw",
        "twitch",
    ],

    isEnabled: false,

    help: () => {},
}