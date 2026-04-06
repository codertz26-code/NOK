// silatech/getmenuimage.js
module.exports = {
    silacmd: "getmenuimage",
    alias: ["showmenuimage", "viewmenuimage"],
    category: "owner",
    description: "Show current menu image URL",
    usage: "getmenuimage",
    owner: true,
    
    async function(from, conn, { repondre, silaConfig, prefixe }) {
        const currentImage = silaConfig.getImage("menu") || "https://files.catbox.moe/98k75b.jpeg";
        
        return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ᴍᴇɴᴜ ɪᴍᴀɢᴇ
> 🔗 ${currentImage}

> ♱ ᴛᴏ ᴄʜᴀɴɢᴇ: ${prefixe}setimage <url>`);
    }
};