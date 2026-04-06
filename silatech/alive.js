// silatech/alive.js
module.exports = {
    silacmd: "alive",
    alias: ["sila", "online", "status"],
    category: "general",
    description: "Check if bot is online",
    usage: "alive",
    function: async (from, sila, { repondre, args, prefixe, botName }) => {
        const start = Date.now();
        
        // Get bot info
        const botNumber = sila.user.id.split(':')[0];
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
        
        // Array of SCARY/HORROR theme images - random selection
        const scaryImages = [
            "https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=800", // Dark scary forest
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800", // Scary night
            "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800", // Dark horror
            "https://images.unsplash.com/photo-1598528883796-efd7985c9959?w=800", // Scary dark
            "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800", // Horror dark
            "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800", // Creepy dark
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800", // Scary night forest
            "https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=800", // Dark spooky
            "https://images.unsplash.com/photo-1598528883796-efd7985c9959?w=800", // Horror night
            "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800"  // Dark scary
        ];
        
        // Select random image
        const randomImage = scaryImages[Math.floor(Math.random() * scaryImages.length)];
        
        const response = `╭━━━[ ♱ ${botName} ♱ ]━━━╮
┃ ✦ *Status* : 🟢 ONLINE
┃ ✦ *Ping* : ${Date.now() - start}ms
┃ ✦ *Uptime* : ${uptimeString}
┃ ✦ *Bot Number* : ${botNumber}
┃ ✦ *Commands* : ${global.silaCommands.size}
┃ ✦ *Categories* : ${global.categories.size}
╰━━━━━━━━━━━━━━━━━━╯
        
♱ *I'm alive and ready to serve!* ♱`;
        
        // Send with externalAdReply
        await sila.sendMessage(from, {
            text: response,
            contextInfo: {
                externalAdReply: {
                    title: botName,  // Uses the botName variable dynamically
                    body: "♱ The Night is Alive ♱",
                    thumbnailUrl: randomImage,
                    sourceUrl: "https://silatech.com",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    }
};
