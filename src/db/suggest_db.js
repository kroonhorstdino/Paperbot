const Database = require('./database.js')
const Discord = require('discord.js')
const pg = require('pg')

class Suggest_DB {

    /**
     * SUGGESTORS TABLE MODEL:
     * game_names
     * suggestors
     */

    /**
     * Adds suggestions from one discord user
     *
     * @static
     * @param {Message} discordUserID
     * @param {*} suggestions
     * @memberof Suggest_DB
     */
    static async addSuggestion(discordUserID, suggestions) {
        const db = new pg.Client(connectionString);

        suggestions.forEach(s => {
            if (this.suggestionExists(discordUserID, s)) continue;
            
            db.query(`INSERT INTO public.suggestors(game_names, suggestors) VALUES(${discordUserID},${s}) ON CONFLICT ON CONSTRAINT primary_key DO NOTHING`);
        });
    }

    /**
     * Removes specified suggestions of user
     *
     * @static
     * @param {*} discordUserID
     * @param {*} suggestions
     * @memberof Suggest_DB
     */
    static async removeSuggestion(discordUserID, suggestions) {
        if (suggestions == 'all') {
            //REMOVE ALL
        } else {

        }
    }

    /**
     * Get all suggestions a user made
     *
     * @static
     * @param {*} discordUserID
     * @memberof Suggest_DB
     */
    static async getAllSuggestions(discordUserID) {

    }

    /**
     * Did this user already suggest this game
     *
     * @static
     * @param {*} suggestion
     * @memberof Suggest_DB
     */
    static async suggestionExists(discordUserID, suggestion) {
        let result = db.query("SELECT game_name, discord_user_id FROM public.suggestors")
        return (result.rowCount > 0);
    }
}

module.exports = Suggest_DB;