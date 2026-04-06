// silatech/addlink.js
const config = require('../config');

module.exports = [
    {
        silacmd: "resetwarn",
        alias: ["clearwarn", "delwarn"],
        category: "group",
        description: "Reset warnings for a user (Admins/Owner)",
        usage: "resetwarn @user",
        owner: true,
        sudo: true,
        function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, isSudo, resetWarnings }) => {
            if (!from.includes('g.us')) {
                return await repondre("❌ This command can only be used in groups!");
            }
            
            let isAdmin = false;
            try {
                const groupMetadata = await sila.groupMetadata(from);
                const participants = groupMetadata.participants;
                const senderJid = ms.key.participant || ms.key.remoteJid;
                const participant = participants.find(p => p.id === senderJid);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            } catch (err) {}
            
            const isAuthorized = isAdmin || isOwner(senderNumber) || isSudo(senderNumber);
            
            if (!isAuthorized) {
                return await repondre("❌ Only group admins, owner, or sudo can reset warnings!");
            }
            
            const mentionedUser = ms.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (!mentionedUser) {
                return await repondre(`❌ Please mention the user!\n\nExample: ${prefixe}resetwarn @user`);
            }
            
            const userNumber = mentionedUser.split('@')[0];
            resetWarnings(from, mentionedUser);
            
            await repondre(`✅ Warnings reset for @${userNumber}!`, { mentions: [mentionedUser] });
        }
    },
    {
        silacmd: "warnlist",
        alias: ["listwarn", "warnings"],
        category: "group",
        description: "List all warnings in this group (Admins/Owner)",
        usage: "warnlist",
        owner: true,
        sudo: true,
        function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, isSudo, getWarnings }) => {
            if (!from.includes('g.us')) {
                return await repondre("❌ This command can only be used in groups!");
            }
            
            let isAdmin = false;
            try {
                const groupMetadata = await sila.groupMetadata(from);
                const participants = groupMetadata.participants;
                const senderJid = ms.key.participant || ms.key.remoteJid;
                const participant = participants.find(p => p.id === senderJid);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            } catch (err) {}
            
            const isAuthorized = isAdmin || isOwner(senderNumber) || isSudo(senderNumber);
            
            if (!isAuthorized) {
                return await repondre("❌ Only group admins, owner, or sudo can view warnings!");
            }
            
            const warnings = [];
            for (const [key, value] of global.userWarnings.entries()) {
                if (key.startsWith(`${from}|`)) {
                    const userId = key.split('|')[1];
                    warnings.push({ user: userId, count: value });
                }
            }
            
            if (warnings.length === 0) {
                return await repondre("📊 No warnings in this group!");
            }
            
            let response = `╭━━━[ ⚠️ WARNINGS LIST ⚠️ ]━━━╮\n`;
            response += `┃ Total: ${warnings.length} users\n`;
            response += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
            
            for (const warn of warnings) {
                response += `👤 @${warn.user.split('@')[0]}: ${warn.count}/5 warnings\n`;
            }
            
            const mentions = warnings.map(w => w.user);
            await repondre(response, { mentions });
        }
    },
    {
        silacmd: "clearwarns",
        alias: ["clearallwarn", "resetall"],
        category: "group",
        description: "Clear all warnings in this group (Admins/Owner)",
        usage: "clearwarns",
        owner: true,
        sudo: true,
        function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, isSudo, clearGroupWarnings }) => {
            if (!from.includes('g.us')) {
                return await repondre("❌ This command can only be used in groups!");
            }
            
            let isAdmin = false;
            try {
                const groupMetadata = await sila.groupMetadata(from);
                const participants = groupMetadata.participants;
                const senderJid = ms.key.participant || ms.key.remoteJid;
                const participant = participants.find(p => p.id === senderJid);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            } catch (err) {}
            
            const isAuthorized = isAdmin || isOwner(senderNumber) || isSudo(senderNumber);
            
            if (!isAuthorized) {
                return await repondre("❌ Only group admins, owner, or sudo can clear warnings!");
            }
            
            clearGroupWarnings(from);
            await repondre("✅ All warnings in this group have been cleared!");
        }
    }
];