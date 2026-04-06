// silatech/addpremium.js
// Command to add premium user (Owner only)

module.exports = {
    silacmd: "addpremium",
    alias: ["addprem", "premiumadd"],
    category: "owner",
    description: "Add premium user",
    usage: "addpremium <number>",
    owner: true,  // Owner only
    
    async function(from, conn, { repondre, args, silaConfig, addPremiumUser, getPremiumUsers, prefixe }) {
        const config = silaConfig.getBotConfig();
        
        if (!args.length) {
            const premiumUsers = getPremiumUsers();
            let userList = `${config.mainSymbol} ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs ${config.mainSymbol}\n\n`;
            
            if (premiumUsers.length === 0) {
                userList += "📭 ɴᴏ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs ʏᴇᴛ\n";
            } else {
                for (let i = 0; i < premiumUsers.length; i++) {
                    userList += `${i + 1}. ${premiumUsers[i]}\n`;
                }
            }
            
            userList += `\n✨ ᴜsᴀɢᴇ: ${prefixe}addpremium <ɴᴜᴍʙᴇʀ>\n`;
            userList += `♱ ᴇxᴀᴍᴘʟᴇ: ${prefixe}addpremium 255712345678`;
            
            return repondre(userList);
        }
        
        let number = args[0];
        // Clean number
        number = number.replace(/[^0-9]/g, '');
        if (!number.startsWith('255')) {
            number = '255' + number;
        }
        
        const success = addPremiumUser(number);
        
        if (success) {
            const premiumUsers = getPremiumUsers();
            return repondre(`${config.successEmoji} ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ ᴀᴅᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!\n\n📱 ${number}\n📊 ᴛᴏᴛᴀʟ ᴘʀᴇᴍɪᴜᴍ: ${premiumUsers.length}`);
        } else {
            return repondre(`${config.errorEmoji} ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴘʀᴇᴍɪᴜᴍ!`);
        }
    }
};