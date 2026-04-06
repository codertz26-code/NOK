// sila/antibadwords.js
// Anti Bad Words - Delete message with warning, only kick on action

const badWords = [
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'cunt', 'whore', 'slut',
    'nigger', 'nigga', 'faggot', 'retard', 'stupid', 'idiot', 'dumb',
    'mbwa', 'pumbavu', 'mjinga', 'kuma', 'kinyesi'
];

async function handleAntiBadWords(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 "";
    
    const lowerBody = body.toLowerCase();
    let foundBadWord = false;
    let badWordFound = "";
    
    for (const word of badWords) {
        if (lowerBody.includes(word)) {
            foundBadWord = true;
            badWordFound = word;
            break;
        }
    }
    
    if (foundBadWord) {
        console.log(`🔞 AntiBadWords: Bad word detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antibadwords_action') : null;
            const action = groupAction || conf.antibadwords_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅs* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ʙᴀᴅ ᴡᴏʀᴅs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!\n`;
            responseText += `🔞 ᴡᴏʀᴅ: "${badWordFound}" ɪs ғᴏʀʙɪᴅᴅᴇɴ\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ᴜsɪɴɢ ʙᴀᴅ ᴡᴏʀᴅs!`;
            }
            
            await conn.sendMessage(from, {
                text: responseText,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.newsletterJid,
                        newsletterName: config.newsletterName,
                        serverMessageId: 143
                    }
                }
            });
            
            return true;
        } catch (e) {
            console.error('AntiBadWords error:', e);
        }
    }
    return false;
}

function addBadWord(word) {
    if (!badWords.includes(word.toLowerCase())) {
        badWords.push(word.toLowerCase());
        return true;
    }
    return false;
}

function removeBadWord(word) {
    const index = badWords.indexOf(word.toLowerCase());
    if (index !== -1) {
        badWords.splice(index, 1);
        return true;
    }
    return false;
}

module.exports = { handleAntiBadWords, addBadWord, removeBadWord, badWords };