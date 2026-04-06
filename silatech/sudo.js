// silatech/sudo.js
const config = require('../config');

module.exports = [
    {
        silacmd: "addsudo",
        alias: ["addsuda", "sudoadd"],
        category: "owner",
        description: "Add sudo user (Owner only)",
        usage: "addsudo <number>",
        owner: true,
        function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, addSudoUser, getSudoUsers }) => {
            if (!isOwner) {
                return await repondre("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ꜰᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ!");
            }
            
            if (!args[0]) {
                return await repondre(`❌ Usage: ${prefixe}addsudo <number>\n\nExample: ${prefixe}addsudo 255789661031`);
            }
            
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.startsWith('0')) {
                number = '255' + number.slice(1);
            }
            
            if (number.length < 10) {
                return await repondre("❌ Invalid number!");
            }
            
            const added = addSudoUser(number);
            
            if (added) {
                const sudoUsers = getSudoUsers();
                await repondre(`✅ Sudo User Added!\n\n⚡ wa.me/${number}\n📊 Total: ${sudoUsers.length}`);
            } else {
                await repondre(`❌ wa.me/${number} is already a sudo user.`);
            }
        }
    },
    {
        silacmd: "removesudo",
        alias: ["remsudo", "sudoremove", "delsudo"],
        category: "owner",
        description: "Remove sudo user (Owner only)",
        usage: "removesudo <number>",
        owner: true,
        function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, removeSudoUser, getSudoUsers }) => {
            if (!isOwner) {
                return await repondre("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ꜰᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ!");
            }
            
            if (!args[0]) {
                return await repondre(`❌ Usage: ${prefixe}removesudo <number>\n\nExample: ${prefixe}removesudo 255789661031`);
            }
            
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.startsWith('0')) {
                number = '255' + number.slice(1);
            }
            
            const removed = removeSudoUser(number);
            
            if (removed) {
                const sudoUsers = getSudoUsers();
                await repondre(`✅ Sudo User Removed!\n\n⚡ wa.me/${number}\n📊 Total: ${sudoUsers.length}`);
            } else {
                await repondre(`❌ wa.me/${number} is not a sudo user.`);
            }
        }
    },
    {
        silacmd: "sudolist",
        alias: ["listsudo", "sudo"],
        category: "owner",
        description: "List all sudo users (Owner & Sudo)",
        usage: "sudolist",
        owner: true,
        sudo: true,
        function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, isSudo, getSudoUsers }) => {
            const sudoUsers = getSudoUsers();
            
            if (sudoUsers.length === 0) {
                return await repondre("📊 No sudo users found.");
            }
            
            let listText = `╭━━━[ ⚡ SUDO USERS ⚡ ]━━━╮\n`;
            listText += `┃ Total: ${sudoUsers.length}\n`;
            listText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
            
            sudoUsers.forEach((user, index) => {
                listText += `${index + 1}. wa.me/${user}\n`;
            });
            
            await repondre(listText);
        }
    }
];