const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
    applyToChannels: applyToChannels,
    getChannels: getChannels
}

/**
 *
 * Apply function to all channels specified by channelID
 *
 * @param {Discord.Client} client CLient that is active on channels
 * @param {string[]} channelIDs IDs of channels 
 * @param {function(Discord.TextChannel):void} callback called when done
 */
function applyToChannels(client, channelIDs, callback, ...params) {
    let channels = getChannels(client, channelIDs);

    channels.forEach(channel => {
        callback(channel);
    })
}

/**
 *
 * Get all channels specified by channelIDs
 *
 * @param {Discord.Client} client
 * @param {string[]} channelIDs
 * @returns {Discord.Collection<string,Discord.Channel>} Collection of channels
 */
function getChannels(client, channelIDs) {
    return client.channels.filter(channel => channelIDs.includes(channel.id));
}