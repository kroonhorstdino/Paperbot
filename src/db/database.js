const Sequelize = require("sequelize");
const secret = require("../../config.json");
const fs = require("fs");

module.exports = class Database {

    constructor(db_name) {
        
    }

    /**
     * Connects to specified database
     *
     * @param {*} db_name Name of database
     */
    connect(db_name) {
        this.sequelize = new Sequelize({
            host: secret.database.host,
            database: secret.database.database,            
            username: secret.database.username,
            password: secret.database.password,
            dialect: secret.database.dialect
        })
    }
}

//TODO BIG TODO