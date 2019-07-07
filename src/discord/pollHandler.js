const Discord = require('discord.js');
const config = require('../../config.json');
const Database = require('../db/database.js');

class PollHandler {

    get closePollCollectors() {
        return PollHandler.closePollCollectors;
    }

    /**
     * 
     * @param {Discord.Client} client 
     */
    static async collectPolls() {
        let result = await Database.db.query(`SELECT message_id, channel_id FROM public.polls`);
        let polls = result.rows;

        /** 
         * @type {Discord.Message}
         */
        let message;
        /** 
         * @type {Discord.TextChannel}
         */
        let channel;

        //Create collector for each poll
        for (let poll of polls) {
            channel = global._client.channels.find(channel => channel.id == poll.channel_id); //Find channel of message
            message = channel.messages.get(poll.message_id); //Get message of poll

            let reactionCollector = message.createReactionCollector(PollHandler.pollCloseReactionFilter); //Create collector
            reactionCollector.on('collect', this.OnClosePollReaction); //If emojis for closing polls are being used

            PollHandler.closePollCollectors.push(reactionCollector);
        }
    }

    /** 
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.Collector<string, Discord.MessageReaction>} reactionCollector
     */
    static OnClosePollReaction(reaction, reactionCollector) {
        console.log("Hello");
    }

    /** 
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User} user
     */
    pollCloseReactionFilter(reaction, user) {
        return reaction.message.author.id == user.id;
    }
}

/** 
 * @type {Discord.ReactionCollector[]}
 */
PollHandler.closePollCollectors = [];

module.exports = PollHandler;