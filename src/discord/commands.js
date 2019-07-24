const chalk = require("chalk");
const Discord = require("discord.js");
const fs = require("fs");

const help = require('./help.js');

const config = require("../../config.json");

module.exports = class Commands {

    constructor() {
        this.commandFiles = [];
        this.collectCommandFiles();
        this.prefix = (process.env.NODE_ENV == "debug") ? config.discord.debug_prefix : config.discord.production_prefix;
    }

    /**
     * Handle command inputs  
     * 
     * @param {Discord.Message} msg
     */
    handleCommand(msg) { //TODO integrate isCommand and getCommandFile
        if (!msg.content.toLowerCase().startsWith(this.prefix)) return

        let content = msg.content//.replace(/[\r\n]+/gm, "");
        content = content.trim().substring(this.prefix.length).split(" "); //String array without prefix
        let root = content.shift();

        content = content.filter(word => word.replace(new RegExp('\\s+'),'') != '')

        this.commandFiles.forEach((cmdObj) => {
            if (cmdObj.aliases.includes(root)) {
                
                if (help.needsHelp(content)) {
                    help.provideHelp(msg, cmdObj.help())
                } else {       
                    console.log(`Command ${root} entered in <${msg.guild.name}>, <#${msg.channel.name}> by ` + chalk.green(msg.author.username));
                    cmdObj.execute(msg, content);
                }
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
        return cmdString.startsWith(this.prefix);
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
                console.log("Added command >" + command.aliases[0]);
                this.commandFiles.push(command);
            }
        });
    }
}