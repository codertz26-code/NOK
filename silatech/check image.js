// silatech/checkimage.js
module.exports = {
    silacmd: "checkimage",
    alias: ["viewimg", "getimg"],
    category: "owner",
    description: "Check current menu image URL",
    usage: "checkimage",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig }) {
        const menuImage = silaConfig.getImage("menu");
        const defaultImage = silaConfig.DEFAULT_IMAGES.menu;
        
        return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ᴍᴇɴᴜ ɪᴍᴀɢᴇ:
> 🔗 ${menuImage}
> 
> ♱ ᴅᴇғᴀᴜʟᴛ ɪᴍᴀɢᴇ:
> 🔗 ${defaultImage}
> 
> ♱ ᴛᴏ ᴄʜᴀɴɢᴇ: .setimage menu <new_url>`);
    }
};