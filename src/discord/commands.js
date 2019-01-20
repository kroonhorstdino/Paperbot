const Discord = require("discord.js");
const ping = require("../cmds/ping.js");
const fs = require("fs");
const path = require("path");

module.exports = class Commands {

    constructor() {
        this.commandFiles = [];
        collectCommandFiles();
    }

    /**
     * Handle command inputs  
     * 
     * @param {Discord.Message} cmd
     */
    handleCommand(cmd) { //TODO integrate isCommand and getCommandFile
        switch (cmd.content) {
            case "p?ping":
                ping.execute(cmd);
                break;
            default:
                break;
        }
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
            this.commandFiles.push(require(filePath));
        });
    }
}