// silatech/restart.js
const config = require('../config');

module.exports = {
    silacmd: "restart",
    alias: ["reboot"],
    category: "owner",
    description: "Restart the bot (Owner & Sila only)",
    usage: "restart",
    function: async (from, sila, { ms, repondre, args, prefixe, botName }) => {
        // Check if user is owner or Sila (creator)
        const sender = ms.key.fromMe ? sila.user.id.split(':')[0] : ms.key.participant || ms.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        const authorizedUsers = [config.OWNER_NUMBER, config.DEV];
        const isAuthorized = authorizedUsers.includes(senderNumber) || ms.key.fromMe;
        
        if (!isAuthorized) {
            return await repondre("❌ *Access Denied!*\n\nThis command is only available for the bot owner and Sila.");
        }
        
        await repondre("🔄 *Restarting bot...*\n\nBot will be back online in a few seconds.");
        
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    }
};