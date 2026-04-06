// silatech/alive.js
const fs = require('fs');  // Ongeza hii line
const config = require('../config');

module.exports = {
    silacmd: "alive2",
    alias: ["pin", "online", "status"],
    category: "general",
    description: "Check if bot is online",
    usage: "alive",
    function: async (from, sila, { repondre, args, prefixe, botName, ms }) => {
        const start = Date.now();
        
        const botNumber = sila.user.id.split(':')[0];
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
        
        const response = `╭━━━[ ♱ ${botName} ♱ ]━━━╮
┃ ✦ *Status* : 🟢 ONLINE
┃ ✦ *Ping* : ${Date.now() - start}ms
┃ ✦ *Uptime* : ${uptimeString}
┃ ✦ *Bot Number* : ${botNumber}
┃ ✦ *Commands* : ${global.silaCommands.size}
┃ ✦ *Categories* : ${global.categories.size}
┃ ✦ *Owner* : ${config.OWNER_NAME}
╰━━━━━━━━━━━━━━━━━━╯
${config.DESCRIPTION}`;
        
        // Check if ALIVE_IMG exists and file exists
        if (config.ALIVE_IMG && fs.existsSync(config.ALIVE_IMG)) {
            await sila.sendMessage(from, { 
                image: { url: config.ALIVE_IMG },
                caption: response
            }, { quoted: ms });
        } else {
            await repondre(response);
        }
    }
};