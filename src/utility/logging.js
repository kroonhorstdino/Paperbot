const Discord = require('discord.js')
const chalk = require("chalk");


module.exports = {
    
    /** 
     * @param {Discord.Message} msg
    */
    createdPoll: (msg) => {
        console.log(chalk.blue(`${msg.author.username} created a poll on ${msg.guild} in the channel ${msg.channel}:${msg.channel.id}`));
    }
}