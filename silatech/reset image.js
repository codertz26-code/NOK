// silatech/resetmenuimage.js
module.exports = {
    silacmd: "resetmenuimage",
    alias: ["resetimage", "defaultmenuimage"],
    category: "owner",
    description: "Reset menu image to default",
    usage: "resetmenuimage",
    owner: true,
    
    async function(from, conn, { repondre, silaConfig, prefixe }) {
        const DEFAULT_IMAGE = "https://files.catbox.moe/98k75b.jpeg";
        const success = silaConfig.setImage("menu", DEFAULT_IMAGE);
        
        if (success) {
            return repondre(`> ♱ ᴍᴇɴᴜ ɪᴍᴀɢᴇ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ!
> 📸 ${DEFAULT_IMAGE}`);
        } else {
            return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇsᴇᴛ ɪᴍᴀɢᴇ`);
        }
    }
};