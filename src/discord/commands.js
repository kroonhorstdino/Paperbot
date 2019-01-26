const chalk = require("chalk");
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const config = require("../../config.json");

module.exports = class Commands {

    constructor() {
        this.commandFiles = [];
        this.collectCommandFiles();
    }

    /**
     * Handle command inputs  
     * 
     * @param {Discord.Message} cmd
     */
    handleCommand(cmd) { //TODO integrate isCommand and getCommandFile

        /**
         * @type {string}
         */
        const prefix = config.discord.prefix;

        if (!cmd.content.startsWith(prefix)) return

        let content = cmd.content.trim().toLowerCase().substring(prefix.length).split(" ");
        let root = content[0];

        this.commandFiles.forEach((cmdObj) => {
            if (cmdObj.aliases.includes(root)) {
                console.log(`Command ${root} entered in <${cmd.guild.name}>, <#${cmd.channel.name}> by ` + chalk.green(cmd.author.username));
                cmdObj.execute(cmd);
            }
        })
    }

/**
 * Returns the command file of the command specified
 *
 * @private
 * @param {string} cmdName Name of the root command
 */
getCommandFile(cmdName) {
    throw new Error("Not yet implemented");
}

/**
 * Evaluates if a string is a command
 *
 * @param {string} cmdString Entire string of command
 * @returns {Boolean} is a command?
 */
isCommand(cmdString) {
    return cmdString.startsWith(config.prefix);
}

/**
 * @private
 * Collect all command files and put them into accesible array *
 */
collectCommandFiles() {

    let commandDir = global.__basedir + "/src/cmds/";

    let fileNames = fs.readdirSync(commandDir);

    fileNames.forEach(fileName => {
        let filePath = commandDir + fileName;
        let command = require(filePath);

        if (command.isEnabled) {
            console.log("Added " + command);
            this.commandFiles.push(command);
        }
    });
}
}