// silatech/removepremium.js
// Command to remove premium user (Owner only)

module.exports = {
    silacmd: "removepremium",
    alias: ["removeprem", "premiumremove", "delpremium"],
    category: "owner",
    description: "Remove premium user",
    usage: "removepremium <number>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, removePremiumUser, getPremiumUsers, prefixe }) {
        const config = silaConfig.getBotConfig();
        
        if (!args.length) {
            const premiumUsers = getPremiumUsers();
            let userList = `${config.mainSymbol} ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs ${config.mainSymbol}\n\n`;
            
            if (premiumUsers.length === 0) {
                userList += "📭 ɴᴏ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs\n";
            } else {
                for (let i = 0; i < premiumUsers.length; i++) {
                    userList += `${i + 1}. ${premiumUsers[i]}\n`;
                }
            }
            
            userList += `\n✨ ᴜsᴀɢᴇ: ${prefixe}removepremium <ɴᴜᴍʙᴇʀ>\n`;
            userList += `♱ ᴇxᴀᴍᴘʟᴇ: ${prefixe}removepremium 255712345678`;
            
            return repondre(userList);
        }
        
        let number = args[0];
        number = number.replace(/[^0-9]/g, '');
        if (!number.startsWith('255')) {
            number = '255' + number;
        }
        
        const success = removePremiumUser(number);
        
        if (success) {
            const premiumUsers = getPremiumUsers();
            return repondre(`${config.successEmoji} ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ ʀᴇᴍᴏᴠᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!\n\n📱 ${number}\n📊 ʀᴇᴍᴀɪɴɪɴɢ ᴘʀᴇᴍɪᴜᴍ: ${premiumUsers.length}`);
        } else {
            return repondre(`${config.errorEmoji} ᴜsᴇʀ ɪs ɴᴏᴛ ᴘʀᴇᴍɪᴜᴍ!`);
        }
    }
};