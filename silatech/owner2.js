// silatech/owner.js
module.exports = {
    silacmd: "owner2",
    alias: ["creator", "dev"],
    category: "owner",
    description: "Show bot owner information",
    usage: "owner",
    function: async (from, sila, { repondre, args, prefixe, botName }) => {
        const response = `╭━━━[ ♱ OWNER INFO ♱ ]━━━╮
┃ ✦ *Name* : SilaTech Developer
┃ ✦ *Role* : Creator & Maintainer
┃ ✦ *Bot* : ${botName}
┃ ✦ *Version* : 1.0.0
╰━━━━━━━━━━━━━━━━━━╯

♱ *For support or issues, contact owner* ♱`;
        
        await repondre(response);
    }
};