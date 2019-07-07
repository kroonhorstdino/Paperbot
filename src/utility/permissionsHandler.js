const Discord = require('discord.js');

module.exports = class PermissionsHandler {

    /** 
     * Checks if all permissions are granted, for a specified GuidlMemeber in a channel
     * 
     * @param {Discord.GuildMember} user
     * @param {Discord.GuildChannel} channel
     * @param {string[]} permissions
     * 
     * @returns Returns true if all permissions are granted
    */
    static async hasChannelPermissions(user, channel, permissions) {
        return await permissions.every(perm => {
            channel.permissionsFor(user).has(perm);
        });
    }
}