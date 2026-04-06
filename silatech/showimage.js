// silatech/showimage.js
module.exports = {
    silacmd: "showimage",
    alias: ["getimage", "viewimage"],
    category: "owner",
    description: "Show current bot image URLs",
    usage: "showimage [type]",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        const type = args[0] ? args[0].toLowerCase() : null;
        
        if (type && type !== "all") {
            const url = silaConfig.getImage(type);
            return repondre(`> ♱ ɪᴍᴀɢᴇ: ${type}
> 🔗 ${url}`);
        }
        
        const images = {
            menu: silaConfig.getImage("menu"),
            alive: silaConfig.getImage("alive"),
            repo: silaConfig.getImage("repo"),
            info: silaConfig.getImage("info"),
            footer: silaConfig.getImage("footer")
        };
        
        let response = `> ♱ ᴄᴜʀʀᴇɴᴛ ʙᴏᴛ ɪᴍᴀɢᴇs:
`;
        
        for (const [key, value] of Object.entries(images)) {
            response += `> 📸 ${key}: ${value}\n`;
        }
        
        return repondre(response);
    }
};