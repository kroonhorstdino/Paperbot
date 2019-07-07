const Discord = require("discord.js");

const Database = require('../db/database.js');
const PermissionsHandler = require('../utility/permissionsHandler.js')

const config = require("../../config.json");
const logging = require('../utility/logging.js');

const emojiRegex = require('emoji-regex');

const RandomColor = require('randomcolor');

//Creates a poll. Votes are through emotes.
module.exports = class Poll {

    /**
     *  Creates poll on which people vote with reactions
     *
     * @param {Discord.Message} msg Message by user
     * @param {string[]} content String message without prefix and root
     */
    static async execute(msg, content) {

        //#TODO Check how to do permissions
        if (!msg.member.hasPermission('ADMINISTRATOR')) {
            let reply = await msg.reply("you don't have permissions to use this command poll!");
            reply.delete(10000);
            return;
        }

        if (['-c', '-close'].includes(content[0])) {
            await this.closePoll(msg, content.slice(1));
        } else {
            await this.createPoll(msg, content);
        }
    }

    /** 
     * @param {Discord.Message} msg
     * @param {String[]} options
     */
    static async createPoll(msg, options) {
        options = options.join(" "); //Join string again, to separate by | later

        //Check if a separator exists, if not stop
        if (!options.includes('|')) {
            this.error(msg, "missingOptions"); //No poll option found
            return;
        }

        options = options.split("|"); //Split message at '|'. The '|' character separates different poll options
        let title = options.shift().trim(); //Get title of poll hile removing it from content

        //Remove empty options ---> A |   | C
        options = options.filter((option) => {
            return option.trim() != "";
        })

        //Check for too many or too few options
        if (options.length > 10) { //Message too long
            this.error(msg, "overOptionLimit");
            return;
        } else if (options.length <= 1) { //Not enough options
            this.error(msg, "missingOptions");
            return;
        }

        //Create embed for poll
        let pollEmbed = this.createEmbed({
            title: `Question: ${title}`,
            date: Date.now(),
            description: `Asked by: ${msg.author.username}`
        });


        /** 
         *
         * ## EXTRACT EMOJI
         *  
         */
        const customRegex = RegExp('(\\<\\:)([^:]+)(\\:\\d+\\>)$') //Regex for custom guild emoji detection

        let pollInitialReactions = []; //Collect reactions to react in one push
        let optionCounter = 0; //Which option we are at

        /** 
         * @type {string}
         */
        let optionEmoji; //The emoji representing the option in reactions
        /** 
         * @type {string}
         */
        let optionString; //The description of an option

        for (let option of options) {

            let regex = emojiRegex(); //Used to match with Unicode Emoji

            //If there is an emoji specified
            if (option.includes(",")) {
                option = option.split(",");
                optionEmoji = option[1].trim();
                optionString = option[0].trim();
                let match;

                if (match = regex.exec(optionEmoji)) { //Is unicode emoji
                    pollInitialReactions.push(match[0]);
                    optionEmoji = match[0]; //match[0] is first mathc for an unicode emoji
                } else if (optionEmoji.match(customRegex)) { //Is custom emoji

                    //Only guild emojis!
                    let customEmoji = msg.guild.emojis.find(emoji => emoji.name == optionEmoji.split(':')[1]); //Get only name of emoji without sorrounding :

                    if (customEmoji != null) { //Emoji was found, can be used in embed
                        pollInitialReactions.push(customEmoji);
                        optionEmoji = customEmoji;
                    } else { //Not a valid emoji! Abort mission
                        this.error(msg, "noGuildEmoji");
                        return;
                    }
                } else { //Nothing valid at all
                    this.error(msg, "noGuildEmoji");
                    return;
                }
            } else { //No emoji specified
                optionString = option.trim();
                optionEmoji = this.emojiToUnicode(optionCounter);

                pollInitialReactions.push(optionEmoji);
            }

            /** 
             * 
             * ## ADD OPTION TO EMBED
             * 
            */
            pollEmbed.addField(
                `${optionEmoji}  |  ${optionString}`,
                "\u2063",
                false);

            optionCounter++;
        }

        for (let emoji of pollInitialReactions) { //Error if emoji duplicates exist
            if (pollInitialReactions.filter(e => e == emoji).length > 1) {
                this.error(msg, "onlyDistinctEmoji");
                return;
            }
        }

        /** 
         * @type {Discord.Message}
         */
        let pollMessage;
        try {
            pollMessage = await msg.channel.send(config.discord.poll.messageTitle); //Send message with text
            pollEmbed.setFooter( /*`${config.discord.poll.embedFooter} |*/ `messsage id: ${pollMessage.id}`); //Add msg id to footer to able to close it later on

            await pollMessage.edit(pollMessage.content, pollEmbed); //Edit message (add embed)

            logging.createdPoll(msg);
            msg.delete(10000);

        } catch (error) {
            console.log("Couldn't create poll, no permissions!");
            return;
        }

        for (let emoji of pollInitialReactions) {
            await pollMessage.react(emoji);
        }

        //Check if the amount of poll options and reactions match
        if (pollMessage.reactions.size != pollEmbed.fields.length) {
            await pollMessage.delete();
            throw "Amount of options and reactions do not match! Abort poll creation!"
        }

        //Inser poll id into databse. For later tracking and closing of poll
        await Database.db.query(`INSERT INTO public.polls VALUES ('${pollMessage.id}','${pollMessage.channel.id}')`); //TODO Own function?
    }

    /** 
     * Close an active poll. Removes all reactions and writes down results in existing messsage in new embed
     * 
     * @param {Discord.Message} msg
     * @param {String[]} content
     */
    static async closePoll(msg, content) {

        if (Number(content[0].trim()) == NaN) {
            this.error(msg, "noValidPollID");
            return;
        }

        if (!PermissionsHandler.hasChannelPermissions(global._client.user, msg.channel, this.permissions.closePoll)) {
            let dm = await msg.author.createDM();
            dm.send("I do no have permissions to send in the channel " + msg.channel.name + '!');
            return;
        }

        const activePollMessageID = content[0];

        let activePollMessage = await msg.channel.fetchMessage(activePollMessageID);
        const result = await Database.db.query(`SELECT message_id FROM public.polls WHERE message_id='${activePollMessageID}'`);

        if (activePollMessage == undefined) {
            this.error(msg, "messageNotFound");
            return;
        }

        //Check if the specified message exists, if not, there is no poll to close.
        //Also check if they want to close a poll on another guild
        if ((result.rowCount) < 1 && activePollMessage.guild == msg.guild) {
            this.error(msg, "noValidPollID");
            return;
        }

        //Embed for active poll
        let pollMessageEmbed = activePollMessage.embeds[0];

        //Embed for closed poll. Replaces old embed for active poll
        let closedPollEmbed = this.createEmbed({
            title: pollMessageEmbed.title,
            date: pollMessageEmbed.timestamp,
            description: pollMessageEmbed.description
        });
        closedPollEmbed.setFooter(`${config.discord.poll.embedFooter} | poll id: ${activePollMessage.id}`);

        /** 
         * @type {Discord.MessageEmbedField[]}
         */
        const optionFields = pollMessageEmbed.fields;
        const optionReactions = activePollMessage.reactions.array();
        let pollResults = [];

        if (optionFields.length > optionReactions.length) {
            this.error(msg, "missingReactions");
            throw "Reactions and Fields do not match for some reason?"
        }

        //For each option, create a pair of option field and matching reaction
        for (let i = 0; i < optionFields.length; i++) {
            // {Option A, 20}
            pollResults.push({
                text: optionFields[i].name,
                count: optionReactions[i].count
            });
        }

        //Sort results for best reaction count
        pollResults.sort((a, b) => {
            return Math.sign(b.count - a.count);
        });

        let rankCounter = 1;
        let rankString = "1"; //That what is shown in each option
        let lastOptionReactionCounter = pollResults[0].count; //Count of votes from option in last iteration

        closedPollEmbed.addField("Voting results:", "\u2063");

        //Add poll results in order
        for (const result of pollResults) {
            if (lastOptionReactionCounter == result.count) {
                rankString = (rankCounter == 1) ? `🏆 ` : `~   `;
            } else {
                rankCounter++;
                rankString = `${rankCounter}. ` //When in first place, display a cup!
            }
            lastOptionReactionCounter = result.count

            closedPollEmbed.addField(`${rankString} (${result.count} votes) --- ${result.text}`, "\u2063");
        }

        await activePollMessage.edit(closedPollEmbed);
        await activePollMessage.clearReactions();

        await Database.db.query(`DELETE FROM public.polls WHERE message_id='${activePollMessageID}'`);
        let successMessage = await msg.reply(`closed poll ${activePollMessage.content} | id:(${activePollMessageID})`);
        await msg.delete();
        successMessage.delete(10000);
    }

    /** 
     * @param {Object} args
     * @param {string} args.title
     * @param {Date} args.date
     * @param {string} args.username
     */
    static createEmbed({
        title,
        date,
        description
    }) {
        return new Discord.RichEmbed()
            .setColor('#cc1212' /*RandomColor()*/ )
            .setTitle(title)
            .setAuthor(`Paperbot poll`, global._client.user.avatarURL)
            .setDescription(description)
            .setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/214/black-question-mark-ornament_2753.png')
            .setTimestamp(date)
    }

    /** 
     * Second options are left in, but unsused
     * @param {number} number Number you want to know the name of
     * @returns Returns full name of the specified number
     */
    static emojiToName(number) {
        return [
            [':zero:', '0️⃣'],
            [':one:', '1️⃣'],
            [':two:', '2️⃣'],
            [':three: ', '3️⃣'],
            [':four:', '4️⃣'],
            [':five:', '5️⃣'],
            [':six:', '6️⃣'],
            [':seven:', '7️⃣'],
            [':eight:', '8️⃣'],
            [':nine:', '9️⃣'],
            //[':ten:', '🔟']
        ][number];
    }

    /** 
     * Returns unicode for emote of number. Only number 0-9 supported
     */
    static emojiToUnicode(number) {
        return ['\u0030\u20E3', "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"][number]
    }

    static get aliases() {
        return [
            "poll",
            "umfrage"
        ]
    }

    static get permissions() {
        return {
            createPoll: [''],
            closePoll: [
                'ADD_REACTIONS',
                'MANAGE_EMOJIS',
                'SEND_MESSAGES',
                'READ_MESSAGE',
                'MANAGE_MESSAGES',
            ],
        }
    }

    static get isEnabled() {
        return config.enabledCommand.poll;
    }

    static help() {
        return {
            cmdName: this.aliases,
            cmdDescription: "Generates a poll with emoji polling method. You can only enter 10 options that don't have a custom emoji attached to it",
            arguments: [
                ["poll title", "Title of poll"],
                ["<poll option, custom emoji>", "Poll options must be separated by a '|'. Custom emoji can be added"]
            ],
            example: "p?poll title | poll option | poll option, :prince150bart: | poll option"
        }
    }

    /** 
     * Post error messages to discord chat
     * @param {Discord.Message} msg
     * @param {String} errorString Error identifier
     */
    static error(msg, errorString) {
        switch (errorString) {
            case "missingOptions":
                msg.reply("You didn't enter any poll options!");
                break;
            case "overOptionLimit":
                msg.reply("You entered too many options! The maximum is 10!");
                break;
            case "noGuildEmoji":
                msg.reply("You have to enter a supported default emote or a custom guild emoji!");
                break;
            case "onlyDistinctEmoji":
                msg.reply("No duplicate emojis for multiple answers possible!");
                break;
            case "noValidPollID":
                msg.reply("No valid poll ID entered!");
                break;
            case "messageNotFound":
                msg.reply("Message was not found!");
                break;
            case "missingReactions":
                msg.reply("There are fewer reactions than options!");
                break;
            default:
                msg.reply("Enter correct parameters!");
                break;
        }
    }
}

//this.execute(null, "Poll title | Option 1 | Option 2")