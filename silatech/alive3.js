// silatech/alive3.js
module.exports = {
    silacmd: "alive3",
    alias: ["online3", "status3", "check3"],
    category: "general",
    description: "Check if bot is alive with full styling from config",
    usage: "alive3",
    function: async (from, sila, { repondre, args, prefixe, botName, cmd, isOwner, isDev, pushName, sender }) => {
        
        // Load bot identity config
        const silaConfig = require('../silamd/sila.js');
        const botIdentity = silaConfig.getBotConfig();
        
        // Load main config
        const config = require('../config.js');
        
        // Get uptime with days, hours, minutes, seconds
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        let uptimeStr = "";
        if (days > 0) {
            uptimeStr = `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            uptimeStr = `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            uptimeStr = `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`;
        } else {
            uptimeStr = `${seconds} second${seconds > 1 ? 's' : ''}`;
        }
        
        // Build response without ✦ emoji
        const response = `┌───『 ${botIdentity.botName} 』───${botIdentity.mainSymbol}
${botIdentity.mainSymbol} *Status* : ${botIdentity.statusEmoji} ONLINE
${botIdentity.mainSymbol} *Version* : ${botIdentity.version}
${botIdentity.mainSymbol} *Creator* : ${botIdentity.creatorName}
${botIdentity.mainSymbol} *Prefix* : ${config.PREFIX}
${botIdentity.mainSymbol} *Mode* : ${config.MODE.toUpperCase()}
${botIdentity.mainSymbol} *Uptime* : ${uptimeStr}
${botIdentity.mainSymbol} *${config.ALIVE_MSG}*
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
        
        await repondre(response);
    }
};