// silatech/premiumonly.js
// Example of premium only command

module.exports = {
    silacmd: "premiumonly",
    alias: ["premcmd", "premiumcmd"],
    category: "premium",
    description: "This command is only for premium users",
    usage: "premiumonly",
    premium: true,  // Hii inafanya command iwe premium only
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe, isPremium, senderNumber }) {
        const config = silaConfig.getBotConfig();
        
        // Hii check inafanywa kwenye index.js, lakini unaweza kuongeza tena hapa kwa usalama
        if (!isPremium) {
            return repondre(`${config.errorEmoji} ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs!\n\n✨ ᴛᴏ ɢᴇᴛ ᴘʀᴇᴍɪᴜᴍ, ᴄᴏɴᴛᴀᴄᴛ: ${config.creatorName} (${config.creatorNumber})`);
        }
        
        // Premium features here
        const premiumFeatures = [
            "✨ Unlimited downloads",
            "🎨 Custom bot branding",
            "🔧 Advanced anti-delete",
            "📸 Custom menu images",
            "⚡ Priority support",
            "💎 Exclusive commands"
        ];
        
        let text = `${config.mainSymbol} ${config.secondarySymbol} ᴘʀᴇᴍɪᴜᴍ ᴄᴏᴍᴍᴀɴᴅ ᴀᴄᴄᴇss ${config.secondarySymbol} ${config.mainSymbol}\n\n`;
        text += `✅ ʏᴏᴜ ᴀʀᴇ ᴀ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ!\n\n`;
        text += `✨ ᴘʀᴇᴍɪᴜᴍ ʙᴇɴᴇғɪᴛs:\n`;
        
        for (const feature of premiumFeatures) {
            text += `   ${feature}\n`;
        }
        
        text += `\n${config.mainSymbol} ${config.footer} ${config.mainSymbol}`;
        
        return repondre(text);
    }
};