const Discord = require("discord.js");

module.exports = {

    /**
     *  Replies to a ping with a pong
     *
     * @param {Discord.Message} msg Message that ping is supposed to reply to
     */
    execute: (msg) => {
        msg.channel.send("@here PONG! 🏓");
    },

    help: () => {

    },
}