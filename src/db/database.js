const secret = require("../../secret.json");
const fs = require("fs");
const pg = require("pg");
const autoBind = require("auto-bind");

class Database {

    get db() {
        return Database.db;
    }

    set db(v) {
        Database.db = v;
    }

    /**
     * Connect to database defined in secret.json
     */
    static async connect() {
        let connectionString = 
            `postgres://${secret.database.connection.user}:${secret.database.connection.password}@${secret.database.connection.host}:5432/${secret.database.connection.database}`;
        //postgres://user:password@host:5432/database_name


        this.db = new pg.Client(connectionString);
        await this.db.connect();        
    }

    static addAnnouncementStreamer({
        user_login,
        user_id,
        isOnline
    }) {
        //INSERT STREAMER
        //CHECK WITH EXISTS STREAMER
    }

    static async existsStreamer({
        user_login,
        user_id
    }) {
        let exists = false;

        if (user_login != null) {
            let result = await Database.db.query(Database.checkIfExistsQuery("user_login", user_login));
            return (result.rowCount > 0);
        } else if (user_id) {

        }

        return exists;
    }

    static checkIfExistsQuery(row_name, streamer_identifier) {
        return "SELECT user_login FROM public.streamers";
    }

    /**
     *
     *
     * @static
     * @memberof Database
     * @returns [{user_login : string, isOnline : boolean}]
     */
    static async getAnnouncementStreamersStatus() {
        let result = await Database.db.query(Database.getAnnouncementStreamersQuery);
        return result.rows;
    }

    /**
     *
     * Updates online status for specified users in the database
     * [
        {user_login, isOnline}
        ]
     *
     * @param {Object[]} streamerStatusData
     * @memberof Database
     */
    static async updateOnlineStatus(streamerStatusData) {
        await Database.db.query(`UPDATE public.streamers SET "isOnline" = ${streamerStatusData.isOnline} WHERE user_login = '${streamerStatusData.user_login}'`);
    }
}

/**
* @type {pg.Client}
* @static
*/
Database.db = {};

Database.getAnnouncementStreamersQuery = {
    name: "announcementStreamersQuery",
    text: "SELECT user_login, \"isOnline\" FROM streamers"
}

module.exports = Database;