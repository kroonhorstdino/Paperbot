const mysql = require("mysql");
const secret = require("../../config.json");
const fs = require("fs");

module.exports =  class Database {

    /** 
     * Connection to database
     * 
     * @static
     * @type {mysql.Connection}
     */
    static connection;

    /**
     *  Established database connection (local for now)
     *  @param {string} databaseName Name of database
     *  @returns {mysql.Connection} db
     */
    static connect(databaseName) {
        let data = secret.database;
        data.database = databaseName;

        //Connect to database with info from config and name of database
        this.connection = mysql.createConnection(data);

        this.connection.connect(err => {
            if (err) {
                console.error('Could not connect to database: ' + err.stack);
                throw err;
            }
            console.log(`Connection establish with id ${db.threadId}`);
        });
    }

    /**
     * Closes connection with database
     */
    static close() {
        this.connection.end();
    }
}