// silatech/owner.js
module.exports = {
    silacmd: "owner",
    alias: ["creator", "dev"],
    category: "owner",
    description: "Show bot owner information",
    usage: "owner",
    function: async (from, sila, { repondre, args, prefixe, botName }) => {
        
        const ownerNumber = "255634060943";
        const ownerName = "SilaTech Developer";
        
        const response = `♱♱━[ ♱ ♱ ɴ o c т u r n a l ♱ ♱ ]━♱♱
♱
♱  👤 *Owner:* ${ownerName}
♱  📱 *Number:* ${ownerNumber}
♱  ✉️ *WhatsApp:* wa.me/${ownerNumber}
♱
♱  🌙 *Bot Name:* ${botName}
♱  ⚡ *Version:* 1.0.0
♱  🔮 *Type:* NOCTURNAL Premium
♱
♱♱♱♱♱ 𝐏𝐨𝐰𝐞𝐝 𝐛𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡 ♱♱♱♱`;

        // Simple text response using repondre (no quoted, no contacts)
        await repondre(response);
    }
};
