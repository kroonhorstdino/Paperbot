const Discord = require("discord.js");
const Suggest_DB = require('../db/suggest_db.js')
const config = require('../../config.json')

module.exports = {

    /**
     *  Takes suggestions from user and saves them
     *
     * @param {Discord.Message} msg Message by user
     * @param {String[]} content String message without prefix and root
     */
    execute: (msg, content) => {

        const discordUserID = msg.author.id


        switch (content[0].trim().toLowerCase()) {
            case 'add':
                suggestions = content.shift().join(' ').split('|') //Remove first argument and split into game suggestions
                Suggest_DB.addSuggestion(discordUserID, suggestions) //Add suggestions to database
                break;
            case 'remove':

                if (content[1].trim().toLowerCase() == 'all') {
                    Suggest_DB.removeSuggestion(discordUserID, 'all')
                }                
                
                Suggest_DB.removeSuggestion(discordUserID, suggestions)
                break;
            case 'list':
                Suggest_DB.getAllSuggestions(discordUserID)
                break;
            default:
                this.error(msg, "missingOptions")
                break;
        }
    },

    aliases: [
        "sg",
        "suggestion",
        "rec"
    ],

    isEnabled: config.enabledCommand.suggest,

    help: () => {},

    /** 
     * Post error messages to discord chat
     * @param {Discord.Message} msg
     * @param {String} errorString Error identifier
     */
    error: (msg, errorString) => {
        switch (errorString) {
            case "missingOptions":
                msg.reply("You didn't enter any options!")
                break;
            default:
                msg.reply("Enter correct parameters!")
                break;
        }
    }
}

//module.exports.execute(null, ["we", "are", "|", "one"])