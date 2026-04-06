const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'antidelete-data.json');
const MESSAGE_FILE = path.join(__dirname, 'messages-cache.json');

// Ensure files exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ antidelete: false }, null, 2));
}
if (!fs.existsSync(MESSAGE_FILE)) {
    fs.writeFileSync(MESSAGE_FILE, JSON.stringify({}, null, 2));
}

// In-memory cache
const MessageStore = new Map();
const MAX_STORED_MESSAGES = 1000;

// ==================== ANTIDELETE FUNCTIONS ====================
async function setAnti(status) {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        data.antidelete = status;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error setting antidelete:', error);
        return false;
    }
}

async function getAnti() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        return data.antidelete || false;
    } catch (error) {
        return false;
    }
}

async function getAllAntiDeleteSettings() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        return { status: data.antidelete || false };
    } catch (error) {
        return { status: false };
    }
}

// ==================== MESSAGE FUNCTIONS ====================
async function saveMessage(id, data) {
    try {
        // Save to memory
        MessageStore.set(id, {
            message: data.message,
            jid: data.jid,
            sender: data.sender,
            timestamp: Date.now()
        });

        // Limit memory
        if (MessageStore.size > MAX_STORED_MESSAGES) {
            const firstKey = MessageStore.keys().next().value;
            MessageStore.delete(firstKey);
        }

        // Save to file
        const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE));
        messages[id] = {
            message: data.message,
            jid: data.jid,
            sender: data.sender,
            timestamp: Date.now()
        };
        fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

async function loadMessage(id) {
    try {
        // Try memory first
        const cached = MessageStore.get(id);
        if (cached) {
            return {
                message: cached.message,
                jid: cached.jid,
                sender: cached.sender
            };
        }

        // Try file
        const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE));
        if (messages[id]) {
            // Add to memory
            MessageStore.set(id, {
                message: messages[id].message,
                jid: messages[id].jid,
                sender: messages[id].sender,
                timestamp: messages[id].timestamp
            });
            return {
                message: messages[id].message,
                jid: messages[id].jid,
                sender: messages[id].sender
            };
        }

        return null;
    } catch (error) {
        console.error('Error loading message:', error);
        return null;
    }
}

// Clean old messages every 30 minutes
setInterval(() => {
    try {
        const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE));
        const cutoff = Date.now() - (1000 * 60 * 60 * 24); // 24 hours
        let cleaned = 0;
        
        for (const [id, data] of Object.entries(messages)) {
            if (data.timestamp < cutoff) {
                delete messages[id];
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
            console.log(`🧹 Cleaned ${cleaned} old messages`);
        }
    } catch (error) {
        console.error('Error cleaning messages:', error);
    }
}, 1000 * 60 * 30);

// ==================== INITIALIZATION ====================
async function initializeDatabase() {
    console.log('✅ JSON database initialized (no SQLite)');
    return true;
}

async function initializeAntiDeleteSettings() {
    return true;
}

// ==================== PLACEHOLDER FUNCTIONS ====================
async function getName(jid) { return jid.split('@')[0]; }
async function saveContact(jid, name) { return true; }
async function getChatSummary(jid) { return { total: 0, today: 0 }; }
async function saveGroupMetadata(jid, metadata) { return true; }
async function getGroupMetadata(jid) { return null; }
async function saveMessageCount(jid, participant, count) { return true; }
async function getInactiveGroupMembers(jid, days = 7) { return []; }
async function getGroupMembersMessageCount(jid) { return []; }

// ==================== EXPORTS ====================
module.exports = {
    initializeDatabase,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    getAllAntiDeleteSettings,
    saveMessage,
    loadMessage,
    getName,
    saveContact,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount
};