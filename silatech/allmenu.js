// silatech/allmenu.js
module.exports = {
    silacmd: "allmenu",
    alias: ["allcmd", "listall"],
    category: "general",
    description: "Show all commands with categories",
    usage: "allmenu",
    function: async (from, zk, { ms, repondre, prefixe, botName, senderNumber }) => {
        let menuText = `╭━━━[ 📋 ALL COMMANDS ]━━━╮\n`;
        menuText += `┃ Bot: ${botName}\n`;
        menuText += `┃ Prefix: ${prefixe}\n`;
        menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
        
        for (const [category, commands] of global.categories) {
            menuText += `╭━━━[ ${category.toUpperCase()} ]━━━╮\n`;
            for (const cmd of commands) {
                let badge = "";
                if (cmd.premium) badge = " ✨";
                if (cmd.owner) badge = " 👑";
                if (cmd.sudo) badge = " ⚡";
                menuText += `┃ ${prefixe}${cmd.name} - ${cmd.desc}${badge}\n`;
            }
            menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
        }
        
        menuText += `📌 *Badges:*\n`;
        menuText += `✨ = Premium Only\n`;
        menuText += `👑 = Owner Only\n`;
        menuText += `⚡ = Sudo Only\n`;
        
        await repondre(menuText);
    }
};