// silatech/setfont.js
module.exports = {
    silacmd: "setfont",
    alias: ["changefont", "font"],
    category: "owner",
    description: "Change bot font style",
    usage: "setfont <style>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        const fonts = silaConfig.getAvailableFonts();
        
        if (!args.length) {
            let fontList = "♱ ᴀᴠᴀɪʟᴀʙʟᴇ ғᴏɴᴛs ♱\n\n";
            for (const [key, name] of Object.entries(fonts)) {
                fontList += `✦ ${key}: ${name}\n`;
            }
            fontList += `\n♱ ᴜsᴀɢᴇ: ${prefixe}setfont <sᴛʏʟᴇ>\n♱ ᴇxᴀᴍᴘʟᴇ: ${prefixe}setfont bold`;
            return repondre(fontList);
        }
        
        const fontName = args[0].toLowerCase();
        if (!fonts[fontName]) {
            return repondre(`♱ ❌ ɪɴᴠᴀʟɪᴅ ғᴏɴᴛ! ᴜsᴇ: ${prefixe}setfont ᴛᴏ sᴇᴇ ᴀᴠᴀɪʟᴀʙʟᴇ ғᴏɴᴛs ♱`);
        }
        
        const success = silaConfig.setCurrentFont(fontName);
        if (success) {
            const config = silaConfig.getBotConfig();
            const testText = silaConfig.applyFont(`Hello! This is ${config.botName}`, fontName);
            return repondre(`♱ ${config.mainSymbol} ғᴏɴᴛ ᴄʜᴀɴɢᴇᴅ ᴛᴏ: ${fonts[fontName]} ${config.mainSymbol}\n\n📝 ᴛᴇsᴛ: ${testText}`);
        } else {
            return repondre(`♱ ❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴄʜᴀɴɢᴇ ғᴏɴᴛ ♱`);
        }
    }
};