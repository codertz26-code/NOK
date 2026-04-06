// silatech/antilink.js
const antilinkLib = require('../sila/antilink');
const config = require('../config');

module.exports = {
    silacmd: "antilink",
    alias: ["anti-link", "linkguard"],
    category: "group",
    description: "Enable/disable antilink in group (Admins only)",
    usage: "antilink [on/off]",
    function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isOwner, isSudo }) => {
        // Only works in groups
        if (!from.includes('g.us')) {
            return await repondre("❌ This command can only be used in groups!");
        }
        
        // Check if user is admin
        let isAdmin = false;
        try {
            const groupMetadata = await sila.groupMetadata(from);
            const participants = groupMetadata.participants;
            const senderJid = ms.key.participant || ms.key.remoteJid;
            const participant = participants.find(p => p.id === senderJid);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (err) {
            return await repondre("❌ Failed to get group metadata!");
        }
        
        // Check if user is authorized (admin, owner, or sudo)
        const isAuthorized = isAdmin || isOwner(senderNumber) || isSudo(senderNumber);
        
        if (!isAuthorized) {
            return await repondre("❌ Only group admins, owner, or sudo can toggle antilink!");
        }
        
        const status = args[0]?.toLowerCase();
        
        if (status === 'on' || status === 'off') {
            antilinkLib.setAntilink(from, status === 'on');
            
            // Update settings.json
            const fs = require('fs');
            const settingsPath = './settings.json';
            const settings = JSON.parse(fs.readFileSync(settingsPath));
            settings.antilink = (status === 'on');
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            
            return await repondre(`✅ Antilink is now ${status.toUpperCase()} in this group!\n\n⚠️ Anyone sending links will be warned and the message will be deleted.`);
        } else {
            const currentStatus = antilinkLib.isAntilinkEnabled(from) ? 'ON' : 'OFF';
            return await repondre(`🔗 *Antilink Status*\n\n📌 Status: ${currentStatus}\n📌 Whitelisted: ${config.LINK_WHITELIST}\n📌 Action: ${config.LINK_ACTION}\n📌 Warn Limit: ${config.LINK_WARN_LIMIT}\n\n📝 *Use:* ${prefixe}antilink on/off`);
        }
    }
};