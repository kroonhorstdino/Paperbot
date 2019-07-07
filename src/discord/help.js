const config = require('../../config.json')
const Discord = require('discord.js')

/** 
 * HELP COMMAND OBJECT STRUCTURE:
  {
     cmdName: module.exports.aliases,
     cmdDescription: "Generates a poll with emoji polling method.",
     arguments: [
         ["poll title", "Title of poll"],
         ["...poll options", "Poll options as string. Every option must be separated by a '|' character"]
     ],
     example: "p?poll Titel | Option A | Option B | Option C"
 }
*/
module.exports = {

    /** 
     * Checks if this command is a cry for help
     * @param {String[]} content
    */
    needsHelp: (content) => {
        if (config.discord.help.helpStrings.includes(content[0])) return true;
        return false;
    },

    /** 
     * 
     * @param {Discord.Message} msg
     * @param {Object} cmdHelpObj
    */
    construct: (msg, cmdHelpObj) => {
        if (cmdHelpObj == {} || cmdHelpObj == null) {
            msg.reply("this command doesn't have a help page :(");
            return;
        }

        let embed = new Discord.RichEmbed()
            .setColor('#cc1212' /*RandomColor()*/)
            .setTitle(`Help for the ${cmdHelpObj.cmdName[0]} command`)
            .setAuthor(`${global._client.user.username}`, global._client.user.avatarURL)
            .setDescription(cmdHelpObj.cmdDescription)
            .setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/214/black-question-mark-ornament_2753.png')
            .setTimestamp(Date.now())
            .setFooter(config.discord.help.embedFooter /*, 'https://i.imgur.com/wSTFkRM.png'*/)
            .addField("Usage: ", cmdHelpObj.example)
            .addBlankField(true);
        
        //Add fields for arguments
        cmdHelpObj.arguments.forEach(argument => {
            let argumentName = argument[0];
            let argumentDesc = argument[1];

            embed.addField(argumentName, argumentDesc, false);
        });
        
        return embed;
    },

    /** 
     * 
     * @param {Discord.Message} msg
     * @param {Object} cmdHelpObj
    */
    provideHelp: (msg, cmdHelpObj) => {
        let embed = module.exports.construct(msg, cmdHelpObj);
        msg.reply(embed);
    }
}