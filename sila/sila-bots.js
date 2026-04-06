const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers 
} = require('baileys');
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration - Badilisha hapa format ya code
global.pairingCode = "RAAAAAAA"; // Format: R + 7 alphanumeric chars

// Store active subbots
const activeSubBots = new Map();
const pendingPairing = new Map();

// Generate random pairing code
function generatePairingCode() {
    const prefix = global.pairingCode.charAt(0);
    const length = global.pairingCode.length - 1;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create subbot session directory
function getSubBotPath(jid) {
    const safeJid = jid.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(__dirname, '..', 'subbots', safeJid);
}

// Initialize subbot - SAWIET STYLE
async function createSubBot(ownerJid, pairingCode, mainBot) {
    const subBotPath = getSubBotPath(ownerJid);
    
    if (!fs.existsSync(subBotPath)) {
        fs.mkdirSync(subBotPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(subBotPath);
    const { version } = await fetchLatestBaileysVersion();

    const subBot = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: Browsers.ubuntu("Safari"),
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false
    });

    // Store in active bots
    activeSubBots.set(ownerJid, {
        socket: subBot,
        code: pairingCode,
        connected: false,
        startedAt: new Date(),
        path: subBotPath
    });

    // SAWIET STYLE PAIRING CODE REQUEST
    if (!subBot.authState.creds.registered) {
        console.log(chalk.white(`• Requesting Pairing Code for ${ownerJid}`));
        
        setTimeout(async () => {
            try {
                // Extract number from JID (remove @s.whatsapp.net)
                const phoneNumber = ownerJid.split('@')[0];
                
                // Request pairing code - SAWIET STYLE
                const code = await subBot.requestPairingCode(
                    phoneNumber.trim(),
                    pairingCode // Custom code
                );
                
                console.log(chalk.white(`• SubBot Pairing Code: ${code}`));
                
                // Store pending
                pendingPairing.set(ownerJid, {
                    code: code,
                    socket: subBot,
                    expiresAt: Date.now() + (5 * 60 * 1000)
                });

                // Send code to user via main bot
                await mainBot.sendMessage(ownerJid, {
                    text: `*🔐 SUBBOT PAIRING CODE*\n\nCode: *${code}*\n\n*Instructions:*\n1. Open WhatsApp on your phone\n2. Go to Settings → Linked Devices\n3. Tap "Link a Device"\n4. Select "Link with phone number instead"\n5. Enter the code above: *${code}*\n\n⏳ *Expires in 5 minutes*`
                });

            } catch (err) {
                console.error('Pairing code error:', err);
                await mainBot.sendMessage(ownerJid, {
                    text: `*❌ Error generating pairing code:*\n${err.message}\n\nPlease try again with .code`
                });
                
                // Cleanup on error
                activeSubBots.delete(ownerJid);
            }
        }, 4000);
    }

    // Handle connection
    subBot.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            
            if (reason === DisconnectReason.loggedOut) {
                activeSubBots.delete(ownerJid);
                pendingPairing.delete(ownerJid);
                
                await mainBot.sendMessage(ownerJid, { 
                    text: `*❌ SUBBOT DISCONNECTED*\n\nYour subbot session has been logged out. Use *.code* to generate a new pairing code.` 
                });
                
                if (fs.existsSync(subBotPath)) {
                    fs.rmSync(subBotPath, { recursive: true, force: true });
                }
            } else {
                // Reconnect on other errors
                setTimeout(() => createSubBot(ownerJid, pairingCode, mainBot), 5000);
            }
        } 
        else if (connection === 'open') {
            const botInfo = activeSubBots.get(ownerJid);
            if (botInfo) {
                botInfo.connected = true;
                activeSubBots.set(ownerJid, botInfo);
            }

            // Remove from pending if there
            pendingPairing.delete(ownerJid);

            await mainBot.sendMessage(ownerJid, {
                text: `*✅ SUBBOT CONNECTED SUCCESSFULLY!*\n\n🤖 *Status:* Online\n📱 *Number:* ${subBot.user.id.split(':')[0]}\n🔑 *Code:* ${pairingCode}\n⏰ *Connected:* ${new Date().toLocaleString()}\n\nYour subbot is now active and mirroring all messages.`
            });

            console.log(`[SubBot] Connected: ${ownerJid}`);
        }
    });

    // Save credentials
    subBot.ev.on('creds.update', saveCreds);

    // Handle messages (mirror to main bot owner)
    subBot.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNum = sender.split('@')[0];

        if (from === 'status@broadcast') return;

        const body = msg.message.conversation 
            || msg.message.extendedTextMessage?.text 
            || msg.message.imageMessage?.caption 
            || msg.message.videoMessage?.caption 
            || "[Media/Document]";

        let notification = `*📨 NEW MESSAGE ON SUBBOT*\n\n`;
        notification += `*From:* @${senderNum}\n`;
        notification += `*Chat:* ${from.includes('g.us') ? 'Group' : 'Private'}\n`;
        notification += `*Time:* ${new Date().toLocaleString()}\n\n`;
        notification += `*Message:*\n${body.substring(0, 500)}${body.length > 500 ? '...' : ''}`;

        await mainBot.sendMessage(ownerJid, {
            text: notification,
            mentions: [sender]
        });

        // Forward media
        const messageType = Object.keys(msg.message)[0];
        if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(messageType)) {
            try {
                await mainBot.sendMessage(ownerJid, {
                    forward: msg,
                    contextInfo: { forwardingScore: 1, isForwarded: true }
                });
            } catch (e) {
                console.log('Failed to forward media:', e.message);
            }
        }
    });

    return subBot;
}

// Handle .code command
async function handleCodeCommand(from, sender, mainBot, args) {
    const senderJid = sender;
    const senderNum = sender.split('@')[0];

    // Check if already has active subbot
    if (activeSubBots.has(senderJid)) {
        const existing = activeSubBots.get(senderJid);
        if (existing.connected) {
            return await mainBot.sendMessage(from, {
                text: `*⚠️ You already have an active subbot!*\n\nCode: *${existing.code}*\nStatus: 🟢 Connected\n\nUse *.stopbot* to disconnect first.`
            });
        }
    }

    // Check if pending pairing
    if (pendingPairing.has(senderJid)) {
        const pending = pendingPairing.get(senderJid);
        const timeLeft = Math.ceil((pending.expiresAt - Date.now()) / 60000);
        
        if (timeLeft > 0) {
            return await mainBot.sendMessage(from, {
                text: `*⏳ Pairing already in progress!*\n\nCode: *${pending.code}*\nExpires in: ${timeLeft} minutes\n\nComplete the linking process or wait for expiry.`
            });
        } else {
            pendingPairing.delete(senderJid);
        }
    }

    // Generate custom code
    const customCode = generatePairingCode();

    await mainBot.sendMessage(from, {
        text: `*🤖 SUBBOT SETUP*\n\nGenerating pairing session...\nCustom ID: *${customCode}*\n\nPlease wait...`
    });

    try {
        // Create subbot instance - SAWIET STYLE
        await createSubBot(senderJid, customCode, mainBot);
        
    } catch (error) {
        console.error('Subbot creation error:', error);
        await mainBot.sendMessage(from, {
            text: `*❌ Failed to create subbot:*\n${error.message}`
        });
    }
}

// Handle .stopbot command
async function handleStopBotCommand(from, sender, mainBot) {
    const senderJid = sender;

    if (!activeSubBots.has(senderJid) && !pendingPairing.has(senderJid)) {
        return await mainBot.sendMessage(from, {
            text: `*⚠️ No active subbot found!*\n\nUse *.code* to create a new subbot.`
        });
    }

    const botInfo = activeSubBots.get(senderJid);
    if (botInfo?.socket) {
        try {
            await botInfo.socket.logout();
        } catch (e) {
            console.log('Logout error:', e.message);
        }
    }

    activeSubBots.delete(senderJid);
    pendingPairing.delete(senderJid);

    const subBotPath = getSubBotPath(senderJid);
    if (fs.existsSync(subBotPath)) {
        fs.rmSync(subBotPath, { recursive: true, force: true });
    }

    await mainBot.sendMessage(from, {
        text: `*✅ Subbot disconnected and removed successfully!*\n\nAll session data has been cleared.`
    });
}

// Handle .subbots command (admin only)
async function handleSubBotsListCommand(from, sender, mainBot, isOwner = false) {
    if (!isOwner) {
        return await mainBot.sendMessage(from, {
            text: `*❌ Owner only command!*`
        });
    }

    let list = `*🤖 ACTIVE SUBBOTS*\n\n`;
    
    if (activeSubBots.size === 0) {
        list += `_No active subbots_`;
    } else {
        let i = 1;
        for (const [jid, info] of activeSubBots) {
            const status = info.connected ? '🟢' : '🟡';
            list += `${i}. ${status} @${jid.split('@')[0]}\n`;
            list += `   Code: ${info.code}\n`;
            list += `   Started: ${info.startedAt.toLocaleString()}\n\n`;
            i++;
        }
    }

    list += `\n*Pending Pairing:* ${pendingPairing.size}`;

    await mainBot.sendMessage(from, {
        text: list,
        mentions: Array.from(activeSubBots.keys())
    });
}

// Get subbot stats
function getSubBotStats() {
    return {
        active: activeSubBots.size,
        connected: Array.from(activeSubBots.values()).filter(b => b.connected).length,
        pending: pendingPairing.size
    };
}

// Cleanup expired pairings periodically
setInterval(() => {
    const now = Date.now();
    for (const [jid, info] of pendingPairing.entries()) {
        if (now > info.expiresAt) {
            console.log(`[SubBot] Expired pairing for ${jid}`);
            pendingPairing.delete(jid);
            try {
                info.socket?.end();
            } catch (e) {}
        }
    }
}, 60000);

module.exports = {
    handleCodeCommand,
    handleStopBotCommand,
    handleSubBotsListCommand,
    getSubBotStats,
    activeSubBots,
    pendingPairing,
    generatePairingCode
};
