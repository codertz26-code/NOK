const { 
    downloadContentFromMessage,
    proto,
    getContentType: _getContentType
} = require('baileys');

// ==================== SMS HELPER ====================
const sms = (conn, m) => {
    if (!m) return m;
    
    const M = proto.WebMessageInfo;
    
    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe ? conn.user.id : m.participant || m.key.participant || m.chat || m.key.remoteJid;
    }
    
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
        m.body = m.message.conversation || m.msg?.text || m.msg?.caption || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';
        
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];
        
        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null;
        if (quoted) {
            let type = getContentType(quoted);
            m.quoted = m.msg?.contextInfo?.quotedMessage[type];
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted);
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            m.quoted.mtype = type;
            m.quoted.id = m.msg.contextInfo.stanzaId;
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
            m.quoted.sender = m.msg.contextInfo.participant;
            m.quoted.fromMe = m.quoted.sender === conn.user.id;
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.contentText || '';
            m.quoted.mentionedJid = m.quoted.contextInfo?.mentionedJid || [];
        }
    }
    
    if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg);
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';
    
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : conn.sendText(chatId, text, m, { ...options });
    
    m.copy = () => sms(conn, M.fromObject(M.toObject(m)));
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options);
    
    return m;
};

// ==================== GET CONTENT TYPE ====================
const getContentType = (content) => {
    if (content) {
        const keys = Object.keys(content);
        const key = keys.find(k => (k === 'conversation' || k.endsWith('Message') || k.endsWith('V2') || k.endsWith('V3')) && k !== 'senderKeyDistributionMessage');
        return key;
    }
};

// ==================== DOWNLOAD MEDIA MESSAGE ====================
const downloadMediaMessage = async (message, type, options = {}) => {
    try {
        const typeMap = {
            'image': 'imageMessage',
            'video': 'videoMessage',
            'audio': 'audioMessage',
            'document': 'documentMessage',
            'sticker': 'stickerMessage'
        };
        
        const msgType = typeMap[type] || type;
        const mediaMsg = message[msgType];
        
        if (!mediaMsg) {
            throw new Error(`Media type ${type} not found in message`);
        }
        
        const stream = await downloadContentFromMessage(mediaMsg, type === 'sticker' ? 'image' : type);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        return buffer;
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
};

// ==================== ANTI DELETE (Placeholder - implemented in index.js) ====================
const AntiDelete = async (conn, updates) => {
    console.log('AntiDelete placeholder - implement in index.js');
};

module.exports = {
    sms,
    downloadMediaMessage,
    getContentType,
    AntiDelete
};