const Discord = require("discord.js");
const config = require('../../config.json')

module.exports = class Ping {

    /**
     *  Replies to a ping with a pong
     *
     * @param {Discord.Message} msg Message that ping is supposed to reply to
     */
    static async execute(msg, content) {
        await msg.reply("PONG! 🏓");
    }

    static get aliases() {
        return [
            "ping",
            "p",
            "pg",
        ]
    };

    static get isEnabled() {
        return config.enabledCommand.ping;
    }

    static help() {}
}