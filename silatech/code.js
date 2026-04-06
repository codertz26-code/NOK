// silatech/code.js - Pairing code command

const { handleCodeCommand } = require('../sila/sila-bots');

module.exports = {
    silacmd: "code",
    alias: ["pair", "subbot"],
    category: "subbot",
    description: "Generate pairing code to create your own subbot",
    usage: ".code",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { ms, repondre, senderNumber } = params;
        const sender = ms.key.participant || ms.key.remoteJid;
        
        await handleCodeCommand(from, sender, conn, params.args);
    }
};
