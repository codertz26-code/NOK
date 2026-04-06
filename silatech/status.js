// silatech/status.js
const fs = require('fs');
const os = require('os');
const config = require('../config');

module.exports = {
    silacmd: "status",
    alias: ["botstatus", "stats", "botinfo2"],
    category: "owner",
    description: "Check bot status and statistics (Owner & Sudo only)",
    usage: "status",
    owner: true,
    sudo: true,
    function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, isSudo }) => {
        // Get system information
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
        
        const memoryUsage = process.memoryUsage();
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
        const freeMemory = Math.round(os.freemem() / 1024 / 1024);
        const usedMemory = totalMemory - freeMemory;
        
        const cpuUsage = os.loadavg()[0];
        const cpuCores = os.cpus().length;
        
        const botNumber = sila.user.id.split(':')[0];
        
        const sessionPath = './session';
        const hasSession = fs.existsSync(sessionPath);
        
        let groupCount = 0;
        try {
            const chats = sila.chats;
            if (chats) {
                groupCount = Object.values(chats).filter(chat => chat.id.endsWith('@g.us')).length;
            }
        } catch (err) {}
        
        const premiumPath = './silatz/premium.json';
        const sudoPath = './silatz/sudo.json';
        
        let premiumCount = 0;
        let sudoCount = 0;
        
        try {
            if (fs.existsSync(premiumPath)) {
                const premiumUsers = JSON.parse(fs.readFileSync(premiumPath));
                premiumCount = premiumUsers.length;
            }
            if (fs.existsSync(sudoPath)) {
                const sudoUsers = JSON.parse(fs.readFileSync(sudoPath));
                sudoCount = sudoUsers.length;
            }
        } catch (err) {}
        
        const response = `╭━━━[ ♱ BOT STATUS ♱ ]━━━╮
┃
┃ 📊 BOT INFORMATION
┃ ✦ Name: ${config.BOT_NAME}
┃ ✦ Number: ${botNumber}
┃ ✦ Commands: ${global.silaCommands.size}
┃ ✦ Categories: ${global.categories.size}
┃ ✦ Groups: ${groupCount}
┃ ✦ Session: ${hasSession ? 'Active' : 'Missing'}
┃
┃ 👑 USER STATISTICS
┃ ✦ Premium Users: ${premiumCount}
┃ ✦ Sudo Users: ${sudoCount}
┃
┃ ⏱️ UPTIME
┃ ✦ ${uptimeString}
┃
┃ 💾 MEMORY USAGE
┃ ✦ RAM: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB
┃ ✦ Heap: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB
┃ ✦ System: ${usedMemory} MB / ${totalMemory} MB
┃
┃ 🖥️ SYSTEM INFO
┃ ✦ Platform: ${os.platform()}
┃ ✦ CPU Cores: ${cpuCores}
┃ ✦ CPU Load: ${cpuUsage.toFixed(2)}%
┃ ✦ Node: ${process.version}
┃
┃ 👤 YOUR ROLE
┃ ✦ ${isOwner ? 'BOT OWNER' : 'SUDO USER'}
┃
╰━━━━━━━━━━━━━━━━━━╯`;
        
        await repondre(response);
    }
};