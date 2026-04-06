// silatech/chatbot.js
// Chatbot command

const { handleChatbotToggle } = require('../sila/chatbot');

module.exports = {
    silacmd: "chatbot",
    alias: ["ai", "bot"],
    category: "group",
    description: "Toggle chatbot on/off per group or private",
    usage: "chatbot on/off/status OR chatbot private on/off/status",
    
    async function(from, conn, { repondre, args, ms, isOwner, isAdmin, silaConfig }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        
        // Pass the required parameters to handleChatbotToggle
        const result = await handleChatbotToggle(conn, from, ms, args, isOwner, (isGroup && isAdmin));
        
        // If result is not already handled, return
        if (result !== undefined) return result;
        
        return repondre(`♱ 👻 ᴄᴏᴍᴍᴀɴᴅ ᴘʀᴏᴄᴇssᴇᴅ! ♱`);
    }
};