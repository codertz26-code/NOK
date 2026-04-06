// silatech/setimage.js
module.exports = {
    silacmd: "setimage",
    alias: ["setmenuimage", "changemenuimage"],
    category: "owner",
    description: "Change bot menu image",
    usage: "setimage <url>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        
        if (!args.length) {
            const currentImage = silaConfig.getImage("menu") || "https://files.catbox.moe/98k75b.jpeg";
            return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ᴍᴇɴᴜ ɪᴍᴀɢᴇ
> 🔗 ${currentImage}

> ♱ ᴜsᴀɢᴇ: ${prefixe}setimage https://example.com/image.jpg`);
        }
        
        const url = args[0];
        
        if (!url.startsWith("http")) {
            return repondre(`👻 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴜʀʟ (ʜᴛᴛᴘs://...)`);
        }
        
        const success = silaConfig.setImage("menu", url);
        
        if (success) {
            return repondre(`> ♱ ᴍᴇɴᴜ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ!
> 📸 ɴᴇᴡ ɪᴍᴀɢᴇ: ${url}
> 🔄 ᴜsᴇ ${prefixe}menu5 ᴛᴏ sᴇᴇ ᴛʜᴇ ᴄʜᴀɴɢᴇ`);
        } else {
            return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ɪᴍᴀɢᴇ`);
        }
    }
};