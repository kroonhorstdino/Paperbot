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
 * @param {string[]} channelIDs IDs of channels 
 * @param {function(Discord.TextChannel):void} callback called when done
 */
function applyToChannels(channelIDs, callback, ...params) {
    let channels = getChannels(channelIDs);

    channels.forEach(channel => {
        callback(channel);
    })
}

/**
 *
 * Get all channels specified by channelIDs
 *
 * @param {string[]} channelIDs
 * @returns {Discord.Collection<string,Discord.Channel>} Collection of channels
 */
function getChannels(channelIDs) {
    return global._client.channels.filter(channel => channelIDs.includes(channel.id));
}