const mysql = require("mysql");
const secret = require("../../config.json");
const fs = require("fs");

module.exports = class Database {

    /** 
     * @type {mysql.Connection}
     * 
     */
    connection;

    /**
     * Establishes connection to database.
     * @param {string} databaseName Name of database
     */
    constructor(databaseName) {

        this.connection = connect(databaseName);
    }

    /**
     *  Established database connection
     *  @param {string} databaseName Name of database
     *  @returns {mysql.Connection} db
     */
    connect(databaseName) {
        let data = secret.database;
        data.database = databaseName;

        //Connect to database with info from config and name of database
        let db = mysql.createConnection(data);

        db.connect(err => {
            if (err) {
                console.error('Could not connect to database: ' + err.stack);
                throw err;
            }

            console.log(`Connection establish with id ${db.threadId}`);
            return db;
        });
    }

    /**
     * Closes connection with database
     */
    close() {
        this.connection.end();
    }
}