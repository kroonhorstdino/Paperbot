const Discord = require("discord.js");
const ping = require("./cmds/ping.js");

//TODO Automatically require all files

module.exports = {

    //All valid command files are stored in here
    commandFiles: [],

    /**
     * Returns the command file of the command specified
     *
     * @param {string} cmdName Name of the root command
     */
    getCommandFile: (cmdName) => {
        throw new Error("Not yet implemented");
    },

    /**
     * Evaluates if a string is a command
     *
     * @param {string} cmdString Entire string of command
     */
    isCommand: (cmdString) => {

    },
    /**
    *
    *
    * @param {Discord.Message} cmd
    */
    handleCommand: (cmd) => { //TODO integrate isCommand and getCommandFile
        switch (cmd.content) {
            case "p?ping":
                ping.execute(cmd);
                break;
            default:
        }
    },
}