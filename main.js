/** @type {string} */
global.__basedir = __dirname;
const chalk = require("chalk");

const Discord = require("discord.js");

/**
 * @type {Discord.Client}
 */
global._client = new Discord.Client();

/**
 * JSON FILES
 */
const config = require('./config.json');
const secret = require('./secret.json');

/**
 * BOT MODULES
 */
const Database = require('./src/db/database.js');

const Commands = require("./src/discord/commands.js");
const commands = new Commands();

const TwitchAnnouncement = require("./src/discord/twitch_announcement.js");
const announcer = new TwitchAnnouncement();

const PollHandler = require('./src/discord/pollHandler.js');

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

/**
 * @type {NodeJS.Timeout}
 */
let coroutineID;

global._client.on('ready', async () => {
    console.log(`Connected under name ${global._client.user.tag}`);

    try {
        //Connect to database
        await Database.connect()
    } catch (error) {
        console.log("Could not connect to Database");
    }
    
    let coroutines = [
        {
            enabled: config.twitch.enableUpdate,
            coroutine: announcer.initCheckStreamStatus,
        }
    ]

    for (let c of coroutines.filter(c => c.enabled)) {
        if (c.hasOwnProperty("args")) {
            await c.coroutine(c.args)
        } else {
            await c.coroutine();
        }
    }

    PollHandler.collectPolls();

});

global._client.on('message', (msg) => {
    commands.handleCommand(msg);
});

/* https://github.com/discordjs/guide/blob/master/code-samples/popular-topics/reactions/raw-event.js
global._client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const {
        d: data
    } = event;
    const user = global._client.users.get(data.user_id);
    const channel = global._client.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    global._client.emit(events[event.t], reaction, user);
});

global._client.on('messageReactionAdd', (reaction, user) => {
    console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
});*/


global._client.on('disconnect', (event) => {
    console.warn("DISCONNECTED FROM DISCORD SERVERS!");
    endConnection(400);
});

global._client.on('error', (error) => {
    console.error(error);
    console.log("Business as usual then...");
});

//When any outside source wants to shutdown the process
process.on('SIGINT', function () {
    console.log("Bot stopped from outside");
    endConnection();
});

/**
 * Stops the program properly
 * @param {number} code Exit code 
 */
const endConnection = (code) => {
    announcer.stopStreamCheckStatus();
    Database.end();
    console.log("End execution");
    process.exit(code);
}

if (process.argv[2] == "-debug") {
    global._client.login(secret.discord.debug_token); //DEBUG MODE
    console.log("-->LAUNCHING IN DEBUG MODE!<--")
} else if (process.argv[2] == "-prodcution") {
    global._client.login(secret.discord.production_token); //PRODUCTIO MODE
} else {
    console.log("Nothing happened :(");
    process.exit();
}

console.log(chalk.greenBright('Bot succesfully logged in!'));