console.clear()
console.log("📳 Starting NOCTURNAL-MD...")

// ============ GLOBAL ANTI-CRASH ============
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err)
})
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason)
})

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('baileys')

const P = require('pino')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const express = require("express")
const app = express()
const port = process.env.PORT || 9090
const qrcode = require('qrcode')
const bodyParser = require('body-parser')

// Load central bot configuration
let silaConfig = null
let botIdentity = null

try {
  silaConfig = require('./silamd/sila.js')
  botIdentity = silaConfig.getBotConfig()
} catch (e) {
  console.log("⚠️ sila config not found, using default")
  botIdentity = {
    botName: "NOCTURNAL-MD",
    creatorName: "Sila",
    creatorNumber: "255700000000",
    mainSymbol: "🌑"
  }
}

// Import database functions
const { 
  initializeDatabase,
  setAnti,
  getAnti,
  saveMessage,
  loadMessage 
} = require('./data-json')

// Import sila modules
const antilinkLib = require('./sila/antilink')
const { 
  AntiDelete, 
  DeletedText, 
  DeletedMedia, 
  getMessageType,
  getOwnerJid 
} = require('./sila/antidelete')
const {
  AntiMedia,
  detectMediaType,
  shouldDeleteMedia,
  defaultAntiMediaTypes
} = require('./sila/antimedia')

// Import anti modules
const { handleAntiBug } = require('./sila/antibug')
const { handleAntiSpam } = require('./sila/antispam')
const { handleAntiTag } = require('./sila/antitag')
const { handleAntiFake } = require('./sila/antifake')
const { handleAntiBadWords } = require('./sila/antibadwords')
const { handleAntiViewOnce } = require('./sila/antiviewonce')
const { handleAntiForward } = require('./sila/antiforward')
const { handleAntiGroupLink } = require('./sila/antigrouplink')
const { handleAntiVirtex } = require('./sila/antivirtex')
const { handleAntiCall } = require('./sila/anticall')
const { handleAntiTagAll } = require('./sila/antitagall')
const { handleAntiMentionStatus } = require('./sila/antimentionstatus')
const { handleAntiEdit } = require('./sila/antiedit')

// Import group events handler
const { handleGroupEvents } = require('./sila/silaevents')

// Import chatbot handler
const { handleChatbotMessage } = require('./sila/chatbot')

// Import permission handlers
const premiumHandler = require('./sila/premium')
const sudoHandler = require('./sila/sudo')
const ownerHandler = require('./sila/owner')
const { checkPermissions, getUserLevel, getUserLevelEmoji } = require('./sila/permissions')

global.silaCommands = new Map()
global.categories = new Map()
global.userWarnings = new Map()
global.mutedUsers = new Map()

// ==================== PREMIUM & SUDO SYSTEM ====================
const isPremium = premiumHandler.isPremium
const isSudo = sudoHandler.isSudo
const isOwner = ownerHandler.isOwner
const SILA_NUMBER = botIdentity.creatorNumber

const addPremiumUser = premiumHandler.addPremiumUser
const removePremiumUser = premiumHandler.removePremiumUser
const getPremiumUsers = premiumHandler.getPremiumUsers

const addSudoUser = sudoHandler.addSudoUser
const removeSudoUser = sudoHandler.removeSudoUser
const getSudoUsers = sudoHandler.getSudoUsers

const isSila = (number) => number === SILA_NUMBER

// ==================== FONT FUNCTION ====================
const smallFont = (text) => {
  if (silaConfig && silaConfig.applyFont) {
    return silaConfig.applyFont(text)
  }
  return text
}

// ==================== GROUP SETTINGS MANAGER ====================
const groupSettingsPath = './silatz/group-settings.json'

function loadGroupSettings() {
    if (!fs.existsSync(groupSettingsPath)) {
        return {}
    }
    try {
        return JSON.parse(fs.readFileSync(groupSettingsPath))
    } catch (e) {
        return {}
    }
}

function saveGroupSettings(settings) {
    const dir = path.dirname(groupSettingsPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(groupSettingsPath, JSON.stringify(settings, null, 2))
}

function getGroupSetting(groupId, feature) {
    const settings = loadGroupSettings()
    if (!settings[groupId]) return null
    return settings[groupId][feature]
}

function setGroupSetting(groupId, feature, value) {
    const settings = loadGroupSettings()
    if (!settings[groupId]) settings[groupId] = {}
    settings[groupId][feature] = value
    saveGroupSettings(settings)
    return true
}

// ==================== CHECK IF USER IS ADMIN ====================
async function isUserAdmin(conn, groupId, userId) {
    try {
        const groupMetadata = await conn.groupMetadata(groupId)
        const participant = groupMetadata.participants.find(p => p.id === userId)
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin')
    } catch (e) {
        return false
    }
}

// ==================== CHECK PERMISSIONS ====================
async function hasCommandPermission(conn, from, sender, senderNumber) {
    if (isOwner(senderNumber) || isSudo(senderNumber) || isSila(senderNumber)) {
        return true
    }
    
    if (from.includes('g.us')) {
        const isAdmin = await isUserAdmin(conn, from, sender)
        if (isAdmin) return true
    }
    
    return false
}

// ==================== CHECK IF USER IS MUTED ====================
function isUserMuted(userId) {
    if (!global.mutedUsers.has(userId)) return false
    const muteUntil = global.mutedUsers.get(userId)
    if (Date.now() > muteUntil) {
        global.mutedUsers.delete(userId)
        return false
    }
    return true
}

// ==================== SETTINGS DATABASE ====================
const settingsPath = './settings.json'

function initializeSettings() {
    const defaultSettings = {
        autotyping: config.AUTO_TYPING || false,
        autorecording: config.AUTO_RECORDING || false,
        autoviewstatus: config.AUTO_VIEW_STATUS || false,
        autolikestatus: config.AUTO_LIKE_STATUS || false,
        autoreply: config.AUTO_REPLY || false,
        autoreact: config.AUTO_REACT || false,
        prefix: config.PREFIX || '.',
        MODE: config.MODE || 'public',
        botname: botIdentity.botName,
        antilink: config.ANTI_LINK || false,
        antimedia: false,
        antibug: true,
        antispam: true,
        antitag: true,
        antifake: false,
        antibadwords: true,
        antiviewonce: true,
        antiforward: false,
        antigrouplink: true,
        antivirtex: true,
        antitagall: true,
        anticall: config.ANTI_CALL || false,
        antimentionstatus: true,
        antiedit: true,
        antispam_action: 'delete',
        antitag_action: 'delete',
        antibadwords_action: 'delete',
        antivirtex_action: 'kick',
        antitagall_action: 'delete',
        antigrouplink_action: 'delete',
        antifake_action: 'delete',
        antiforward_action: 'delete',
        antibug_action: 'kick',
        antimentionstatus_action: 'delete',
        antiedit_action: 'delete',
        antimediaTypes: { ...defaultAntiMediaTypes },
        antidelete_dm: true,
        antidelete_group: true
    }
    
    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2))
        return defaultSettings
    }
    
    const existing = JSON.parse(fs.readFileSync(settingsPath))
    
    if (!existing.antimediaTypes) {
        existing.antimediaTypes = { ...defaultAntiMediaTypes }
    }
    
    const newFeatures = ['antibug', 'antispam', 'antitag', 'antifake', 'antibadwords', 
                         'antiviewonce', 'antiforward', 'antigrouplink', 'antivirtex', 
                         'antitagall', 'anticall', 'antimentionstatus', 'antiedit', 'MODE']
    
    for (const feature of newFeatures) {
        if (typeof existing[feature] !== 'boolean' && feature !== 'MODE') {
            existing[feature] = defaultSettings[feature] || false
        }
        if (feature === 'MODE' && !existing.MODE) {
            existing.MODE = defaultSettings.MODE
        }
    }
    
    const newActions = ['antispam_action', 'antitag_action', 'antibadwords_action', 
                        'antivirtex_action', 'antitagall_action', 'antigrouplink_action',
                        'antifake_action', 'antiforward_action', 'antibug_action',
                        'antimentionstatus_action', 'antiedit_action']
    
    for (const action of newActions) {
        if (!existing[action]) {
            existing[action] = defaultSettings[action]
        }
    }
    
    if (typeof existing.antidelete_dm !== 'boolean') existing.antidelete_dm = true
    if (typeof existing.antidelete_group !== 'boolean') existing.antidelete_group = true
    if (typeof existing.antilink !== 'boolean') existing.antilink = config.ANTI_LINK || false
    
    fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2))
    return existing
}

const getSettings = () => {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath))
        
        if (!settings.antimediaTypes || typeof settings.antimediaTypes !== 'object') {
            settings.antimediaTypes = { ...defaultAntiMediaTypes }
            saveSettings(settings)
        }
        
        return settings
    } catch (e) {
        return initializeSettings()
    }
}

const saveSettings = (data) => {
    if (!data.antimediaTypes || typeof data.antimediaTypes !== 'object') {
        data.antimediaTypes = { ...defaultAntiMediaTypes }
    }
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2))
}

// ==================== HELPER FUNCTIONS ====================
const decodeJid = (jid) => {
    if (!jid) return null
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {}
        return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid
    }
    return jid
}

const addWarning = (groupId, userId) => {
    const key = `${groupId}|${userId}`
    const current = global.userWarnings.get(key) || 0
    global.userWarnings.set(key, current + 1)
    return current + 1
}

const getWarnings = (groupId, userId) => {
    return global.userWarnings.get(`${groupId}|${userId}`) || 0
}

const resetWarnings = (groupId, userId) => {
    global.userWarnings.delete(`${groupId}|${userId}`)
}

const clearGroupWarnings = (groupId) => {
    for (const [key] of global.userWarnings.entries()) {
        if (key.startsWith(`${groupId}|`)) global.userWarnings.delete(key)
    }
}

// ==================== SESSION MANAGER WITH sila~ PREFIX ====================
const SESSION_DIR = './sessions'
const SESSION_FILE = path.join(SESSION_DIR, 'creds.json')
const BACKUP_DIR = './session_backups'
const SESSION_PREFIX = 'sila~'

// Create directories
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })

// Backup existing session
function backupSession() {
    if (fs.existsSync(SESSION_FILE)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupPath = path.join(BACKUP_DIR, `creds_${timestamp}.json`)
        fs.copyFileSync(SESSION_FILE, backupPath)
        console.log(`📦 Session backed up: ${backupPath}`)
        
        const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('creds_')).sort()
        while (backups.length > 10) {
            const oldBackup = path.join(BACKUP_DIR, backups.shift())
            fs.unlinkSync(oldBackup)
        }
    }
}

// Generate session with sila~ prefix
function generateSessionBackup() {
    if (fs.existsSync(SESSION_FILE)) {
        const sessionBuffer = fs.readFileSync(SESSION_FILE)
        const zlib = require('zlib')
        const compressedBuffer = zlib.gzipSync(sessionBuffer)
        const base64Session = compressedBuffer.toString('base64')
        const prefixedSession = `${SESSION_PREFIX}${base64Session}`
        
        const sessionBackupPath = path.join(BACKUP_DIR, 'current_session.txt')
        fs.writeFileSync(sessionBackupPath, prefixedSession)
        
        console.log(`📱 Session generated with prefix: ${prefixedSession.substring(0, 50)}...`)
        console.log(`💾 Session saved to: ${sessionBackupPath}`)
        
        return prefixedSession
    }
    return null
}

// Load session from SESSION_ID (supports sila~ prefix)
function loadSessionFromId() {
    let sessionId = config.SESSION_ID
    
    if (!sessionId || sessionId.trim() === '') {
        console.log('❌ No SESSION_ID found in config')
        return false
    }
    
    console.log('📥 Loading session from SESSION_ID...')
    
    try {
        let sessionData = sessionId.trim()
        
        // Remove sila~ prefix if exists
        if (sessionData.startsWith(SESSION_PREFIX)) {
            sessionData = sessionData.substring(SESSION_PREFIX.length)
            console.log('✅ Removed sila~ prefix')
        }
        
        // Decode base64
        const compressedBuffer = Buffer.from(sessionData, 'base64')
        
        // Decompress using zlib
        const zlib = require('zlib')
        const sessionBuffer = zlib.gunzipSync(compressedBuffer)
        
        // Write to creds.json
        fs.writeFileSync(SESSION_FILE, sessionBuffer)
        
        console.log(`✅ Session loaded successfully! (${(sessionBuffer.length / 1024).toFixed(2)} KB)`)
        return true
        
    } catch (err) {
        console.log('❌ Failed to load session:', err.message)
        console.log('⚠️ Make sure you copied the FULL session string with sila~ prefix')
        return false
    }
}

// Auto backup session on interval (every 6 hours)
setInterval(() => {
    if (fs.existsSync(SESSION_FILE)) {
        backupSession()
        generateSessionBackup()
        console.log('🔄 Auto session backup completed')
    }
}, 6 * 60 * 60 * 1000)

// ==================== TEMP SESSION STORAGE FOR QR ====================
let tempSessions = new Map()

// Generate QR code for new device
async function generateNewSession(phoneNumber = null) {
    return new Promise(async (resolve, reject) => {
        const sessionId = Date.now().toString()
        const tempDir = `./temp_sessions/${sessionId}`
        
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const { state, saveCreds } = await useMultiFileAuthState(tempDir)
        const { version } = await fetchLatestBaileysVersion()
        
        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: P({ level: 'silent' }),
            browser: ["Session Generator", "Chrome", "3.0.0"],
            markOnlineOnConnect: false
        })
        
        let qrGenerated = null
        let timeout = setTimeout(() => {
            sock.end(new Error("Timeout"))
            reject(new Error("Session generation timeout"))
        }, 120000) // 2 minutes timeout
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update
            
            if (qr && !qrGenerated) {
                qrGenerated = qr
                const qrImage = await qrcode.toDataURL(qr)
                tempSessions.set(sessionId, {
                    qr: qrImage,
                    status: 'waiting',
                    createdAt: Date.now(),
                    socket: sock
                })
                resolve({ sessionId, qr: qrImage })
            }
            
            if (connection === 'open') {
                clearTimeout(timeout)
                
                // Wait a bit for creds to be saved
                await new Promise(resolve => setTimeout(resolve, 3000))
                
                // Read the session file
                const credsPath = path.join(tempDir, 'creds.json')
                if (fs.existsSync(credsPath)) {
                    const sessionBuffer = fs.readFileSync(credsPath)
                    const zlib = require('zlib')
                    const compressedBuffer = zlib.gzipSync(sessionBuffer)
                    const base64Session = compressedBuffer.toString('base64')
                    const prefixedSession = `${SESSION_PREFIX}${base64Session}`
                    
                    tempSessions.set(sessionId, {
                        status: 'completed',
                        session: prefixedSession,
                        createdAt: Date.now()
                    })
                    
                    // Clean up temp files after 5 minutes
                    setTimeout(() => {
                        if (fs.existsSync(tempDir)) {
                            fs.rmSync(tempDir, { recursive: true, force: true })
                        }
                        tempSessions.delete(sessionId)
                    }, 300000)
                    
                    sock.end()
                    resolve({ sessionId, session: prefixedSession, completed: true })
                } else {
                    reject(new Error("Failed to read session file"))
                }
            }
            
            if (connection === 'close') {
                clearTimeout(timeout)
                if (!tempSessions.get(sessionId)?.status === 'completed') {
                    tempSessions.delete(sessionId)
                    reject(new Error("Connection closed"))
                }
            }
        })
        
        sock.ev.on('creds.update', saveCreds)
    })
}

// ==================== PERFORMANCE OPTIMIZATIONS ====================

// Rate limiter
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests
        this.timeWindow = timeWindow
        this.requests = new Map()
    }
    
    isAllowed(key) {
        const now = Date.now()
        const userRequests = this.requests.get(key) || []
        
        const validRequests = userRequests.filter(t => now - t < this.timeWindow)
        
        if (validRequests.length >= this.maxRequests) {
            return false
        }
        
        validRequests.push(now)
        this.requests.set(key, validRequests)
        return true
    }
}

const commandRateLimiter = new RateLimiter(5, 3000)
const messageRateLimiter = new RateLimiter(10, 1000)

// ==================== LOAD COMMANDS ====================
function loadNocturnalCommands() {
    const silatechDir = path.join(__dirname, 'silatech')
    if (!fs.existsSync(silatechDir)) fs.mkdirSync(silatechDir, { recursive: true })
    
    global.silaCommands.clear()
    global.categories.clear()
    
    const files = fs.readdirSync(silatechDir).filter(file => file.endsWith('.js'))
    
    for (const file of files) {
        try {
            const command = require(path.join(silatechDir, file))
            
            const commands = Array.isArray(command) ? command : [command]
            
            for (const cmd of commands) {
                if (cmd && cmd.silacmd) {
                    global.silaCommands.set(cmd.silacmd, cmd)
                    if (cmd.alias) cmd.alias.forEach(a => global.silaCommands.set(a, cmd))
                    
                    if (cmd.category) {
                        if (!global.categories.has(cmd.category)) {
                            global.categories.set(cmd.category, [])
                        }
                        global.categories.get(cmd.category).push({
                            name: cmd.silacmd,
                            desc: cmd.description || "No description",
                            usage: cmd.usage || cmd.silacmd,
                            premium: cmd.premium || false,
                            owner: cmd.owner || false,
                            sudo: cmd.sudo || false
                        })
                    }
                }
            }
        } catch (e) { 
            console.error(`Error loading command ${file}:`, e)
        }
    }
    
    console.log(`📚 Loaded ${global.silaCommands.size} commands`)
}

// ==================== MAIN BOT FUNCTION ====================
let currentConn = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

async function startNocturnalBot() {
    initializeSettings()
    await initializeDatabase()
    console.log('🛡️ AntiDelete database initialized')
    
    // Load session from SESSION_ID if creds doesn't exist
    if (!fs.existsSync(SESSION_FILE)) {
        if (!loadSessionFromId()) {
            console.log('⚠️ No valid session found. Please generate session from website first!')
            console.log(`📍 Visit: https://${process.env.HEROKU_APP_NAME || 'your-app'}.herokuapp.com/`)
            return
        }
    } else {
        console.log('✅ Existing session found, loading...')
        backupSession()
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
    const { version } = await fetchLatestBaileysVersion()
    
    const sila = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: [botIdentity.botName || "NOCTURNAL-MD", "Chrome", "3.0.0"],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        getMessage: async (key) => {
            const msg = await loadMessage(key.id)
            return msg?.message || undefined
        }
    })
    
    currentConn = sila
    global.conn = sila
    
    sila.ev.on('creds.update', async () => {
        await saveCreds()
        backupSession()
        generateSessionBackup()
    })
    
    sila.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log('Connection closed:', reason)
            
            if (reason !== DisconnectReason.loggedOut) {
                reconnectAttempts++
                if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(5000 * reconnectAttempts, 30000)
                    console.log(`🔄 Reconnecting in ${delay/1000}s (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
                    setTimeout(startNocturnalBot, delay)
                } else {
                    console.log('❌ Max reconnection attempts reached. Please restart bot.')
                }
            } else {
                console.log('🔓 Logged out. Please generate new session from website.')
                if (loadSessionFromId()) {
                    reconnectAttempts = 0
                    setTimeout(startNocturnalBot, 5000)
                }
            }
        } else if (connection === 'open') {
            reconnectAttempts = 0
            try {
                if (silaConfig) {
                    botIdentity = silaConfig.getBotConfig()
                }
            } catch (e) {}
            
            const conf = getSettings()
            console.log(smallFont(`🌑 ${botIdentity.botName} 🌑`))
            console.log(smallFont(`🚀 Bot is online!`))
            console.log(smallFont(`👤 Owner: ${config.OWNER_NUMBER}`))
            console.log(smallFont(`🎨 Creator: ${botIdentity.creatorName} (${botIdentity.creatorNumber})`))
            console.log(smallFont(`📌 Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}`))
            
            try {
                const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`
                await sila.sendMessage(ownerJid, { 
                    text: smallFont(`🌑 ${botIdentity.botName} 🌑\n\n🤖 Bot connected!\n🎨 Creator: ${botIdentity.creatorName}\n📌 Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}\n\n🛡️ All security features are active!`) 
                })
                console.log('✅ Test message sent to owner')
            } catch (e) {
                console.error('❌ Failed to send test message:', e.message)
            }
        }
    })
    
    // ==================== GROUP EVENTS HANDLER ====================
    sila.ev.on('group-participants.update', async (update) => {
        await handleGroupEvents(sila, update, botIdentity, silaConfig)
    })
    
    sila.ev.on('group.update', async (update) => {
        await handleGroupEvents(sila, update, botIdentity, silaConfig)
    })
    
    // ==================== ANTI CALL HANDLER ====================
    sila.ev.on('call', async (call) => {
        const conf = getSettings()
        const isGroupCall = call[0]?.isGroup
        
        let anticallEnabled = false
        
        if (isGroupCall && call[0]?.from) {
            const groupAnticall = getGroupSetting(call[0].from, 'anticall')
            anticallEnabled = groupAnticall !== null ? groupAnticall : conf.anticall
        } else {
            anticallEnabled = conf.anticall
        }
        
        if (anticallEnabled) {
            await handleAntiCall(sila, call, conf)
        }
    })
    
    // ==================== ANTIDELETE HANDLER ====================
    sila.ev.on('messages.update', async (updates) => {
        const conf = getSettings()
        
        for (const update of updates) {
            if (update.update?.message === null) {
                const store = await loadMessage(update.key.id)
                if (!store) continue
                
                const isGroup = store.jid?.includes('g.us')
                
                let shouldProcess = false
                if (isGroup && conf.antidelete_group) shouldProcess = true
                if (!isGroup && conf.antidelete_dm) shouldProcess = true
                
                if (!shouldProcess) continue
                
                console.log("🗑️ Delete detected:", update.key.id)
                await AntiDelete(sila, [update], config, smallFont, silaConfig)
            }
        }
    })
    
    // ==================== MESSAGE HANDLER ====================
    sila.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        
        const from = msg.key.remoteJid
        const conf = getSettings()
        if (silaConfig) {
            botIdentity = silaConfig.getBotConfig()
        }
        
        // Rate limiting check
        const senderKey = msg.key.participant || msg.key.remoteJid
        if (!messageRateLimiter.isAllowed(senderKey)) {
            return
        }
        
        // SAVE MESSAGE FOR ANTIDELETE
        try {
            await saveMessage(msg.key.id, {
                message: msg,
                jid: from,
                sender: msg.key.participant || msg.key.remoteJid
            })
        } catch (e) {
            console.error('Error saving message:', e)
        }
        
        const sender = msg.key.fromMe ? sila.user.id.split(':')[0] : msg.key.participant || msg.key.remoteJid
        const senderNumber = sender.split('@')[0]
        
        // Check if user is muted
        if (isUserMuted(sender) && !msg.key.fromMe && !isOwner(senderNumber) && !isSudo(senderNumber) && !isSila(senderNumber)) {
            await sila.sendMessage(from, { delete: msg.key })
            return
        }
        
        // Check if sender is protected
        let isProtected = isOwner(senderNumber) || isSudo(senderNumber) || isSila(senderNumber)
        
        if (!isProtected && from.includes('g.us')) {
            isProtected = await isUserAdmin(sila, from, sender)
        }
        
        // ==================== ANTI VIEWONCE (Always active) ====================
        if (conf.antiviewonce) {
            await handleAntiViewOnce(sila, msg, sender, senderNumber, config, silaConfig)
        }
        
        // ==================== ANTI FEATURES (Skip protected users) ====================
        if (!msg.key.fromMe && !isProtected) {
            if (conf.antibug && handleAntiBug) await handleAntiBug(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antispam && handleAntiSpam) await handleAntiSpam(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antitag && handleAntiTag) await handleAntiTag(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antibadwords && handleAntiBadWords) await handleAntiBadWords(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antiforward && handleAntiForward) await handleAntiForward(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antigrouplink && handleAntiGroupLink) await handleAntiGroupLink(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antivirtex && handleAntiVirtex) await handleAntiVirtex(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antitagall && handleAntiTagAll) await handleAntiTagAll(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antimentionstatus && handleAntiMentionStatus) await handleAntiMentionStatus(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antiedit && handleAntiEdit) await handleAntiEdit(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antifake && from.includes('g.us') && handleAntiFake) await handleAntiFake(sila, from, msg, sender, senderNumber, conf, silaConfig)
        }
        
        // ==================== ANTILINK (PER-GROUP) ====================
        if (from.includes('g.us') && !msg.key.fromMe && !isProtected && antilinkLib) {
            const groupAntilink = getGroupSetting(from, 'antilink')
            const globalAntilink = conf.antilink
            const shouldCheckLink = groupAntilink !== null ? groupAntilink : globalAntilink
            
            if (shouldCheckLink) {
                try {
                    await antilinkLib.handleAntilink(sila, from, msg, sender, senderNumber, conf)
                } catch (e) {
                    console.error('Antilink error:', e)
                }
            }
        }
        
        // ==================== ANTIMEDIA (PER-GROUP) ====================
        if (from.includes('g.us') && !msg.key.fromMe && !isProtected && shouldDeleteMedia) {
            const groupAntimedia = getGroupSetting(from, 'antimedia')
            const groupAntimediaTypes = getGroupSetting(from, 'antimediaTypes')
            
            let antimediaEnabled = false
            let antimediaTypes = null
            
            if (groupAntimedia !== null) {
                antimediaEnabled = groupAntimedia
                antimediaTypes = groupAntimediaTypes || conf.antimediaTypes || defaultAntiMediaTypes
            } else if (conf.antimedia) {
                antimediaEnabled = true
                antimediaTypes = conf.antimediaTypes || defaultAntiMediaTypes
            }
            
            if (antimediaEnabled && antimediaTypes) {
                const { shouldDelete, type } = shouldDeleteMedia(msg.message, {
                    enabled: true,
                    types: antimediaTypes
                })
                
                if (shouldDelete) {
                    console.log(`🗑️ Antimedia: Deleting ${type} from ${senderNumber} in ${from}`)
                    try {
                        await sila.sendMessage(from, { delete: msg.key })
                        
                        if (config.OWNER_NUMBER) {
                            const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`
                            await sila.sendMessage(ownerJid, {
                                text: smallFont(`> 👻 ANTIMEDIA\n\n> GROUP: ${from}\n> SENDER: @${senderNumber}\n> TYPE: ${type}\n> ACTION: DELETED`),
                                mentions: [sender]
                            })
                        }
                        return
                    } catch (e) {
                        console.error('Antimedia delete error:', e)
                    }
                }
            }
        }
        
        if (config.READ_MESSAGE && !msg.key.fromMe) {
            await sila.readMessages([msg.key])
        }
        
        // Status handler
        if (from === 'status@broadcast') {
            const participant = decodeJid(msg.key.participant || msg.key.remoteJid)
            if (!participant) return
            
            if (conf.autoviewstatus) await sila.readMessages([msg.key])
            
            if (conf.autolikestatus) {
                const emojis = (config.STATUS_REACT_EMOJIS || botIdentity.mainSymbol || '❤️').split(',')
                await sila.sendMessage('status@broadcast', { 
                    react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } 
                }, { statusJidList: [participant] })
            }
            
            if (config.AUTO_STATUS_REACT) {
                await sila.sendMessage('status@broadcast', { 
                    text: botIdentity.botName 
                }, { quoted: msg, statusJidList: [participant] })
            }
            return
        }
        
        if (conf.autotyping) await sila.sendPresenceUpdate('composing', from)
        if (conf.autorecording) await sila.sendPresenceUpdate('recording', from)
        
        if (conf.autoreact && !msg.key.fromMe) {
            const emojis = (config.AUTO_REACT_EMOJIS || botIdentity.mainSymbol || '❤️').split(',')
            await sila.sendMessage(from, { 
                react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } 
            })
        }
        
        const body = msg.message.conversation 
            || msg.message.extendedTextMessage?.text 
            || msg.message.buttonsResponseMessage?.selectedButtonId 
            || msg.message.imageMessage?.caption 
            || msg.message.videoMessage?.caption 
            || ""
        
        if (conf.autoreply && !msg.key.fromMe && body.trim() !== "" && !body.startsWith(conf.prefix) && silaConfig) {
            const autoreplyMsg = silaConfig.getMessage ? silaConfig.getMessage('autoreply') : "Thank you for your message!"
            const formattedMsg = autoreplyMsg
                .replace(/{botSymbol}/g, botIdentity.mainSymbol)
                .replace(/{botName}/g, botIdentity.botName)
                .replace(/{creator}/g, botIdentity.creatorName)
            
            await sila.sendMessage(from, { 
                text: smallFont(`> ${formattedMsg}`),
                contextInfo: silaConfig.getContextInfo ? silaConfig.getContextInfo(sender, botIdentity) : {}
            }, { quoted: msg })
        }
        
        // ==================== MODE CHECK ====================
        const mode = conf.MODE || 'public'
        
        if (mode === 'private' && !isOwner(senderNumber) && !isSudo(senderNumber)) {
            return
        }
        
        if (mode === 'inbox' && from.includes('g.us')) {
            return
        }
        
        if (mode === 'group' && !from.includes('g.us')) {
            return
        }
        
        if (mode === 'self' && !msg.key.fromMe) {
            return
        }
        
        // ==================== CHATBOT HANDLER ====================
        if (!msg.key.fromMe && body.trim() !== "" && !body.startsWith(conf.prefix) && handleChatbotMessage) {
            await handleChatbotMessage(sila, from, msg, botIdentity)
        }
        
        if (!body.startsWith(conf.prefix)) return
        
        const args = body.slice(conf.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()
        
        // Command rate limiting
        if (!commandRateLimiter.isAllowed(senderKey)) {
            await sila.sendMessage(from, { 
                text: smallFont(`> ⚠️ Please slow down! You're sending commands too fast.`),
                delete: msg.key
            })
            return
        }
        
        if (config.READ_CMD && !msg.key.fromMe) await sila.readMessages([msg.key])
        
        // Execute command
        const cmd = global.silaCommands.get(commandName)
        if (cmd) {
            try {
                const isAdminInGroup = from.includes('g.us') ? await isUserAdmin(sila, from, sender) : false
                const permCheck = await checkPermissions(cmd, from, sender, senderNumber, isAdminInGroup)
                
                if (!permCheck.allowed) {
                    return await sila.sendMessage(from, { 
                        text: smallFont(`> ${permCheck.message}`),
                        contextInfo: silaConfig && silaConfig.getContextInfo ? silaConfig.getContextInfo(sender, botIdentity) : {}
                    }, { quoted: msg })
                }
                
                await cmd.function(from, sila, {
                    ms: msg,
                    repondre: async (teks) => {
                        return await sila.sendMessage(from, { 
                            text: smallFont(`${teks}`),
                            contextInfo: silaConfig && silaConfig.getContextInfo ? silaConfig.getContextInfo(sender, botIdentity) : {}
                        }, { quoted: msg })
                    },
                    prefixe: conf.prefix,
                    args: args,
                    botName: botIdentity.botName,
                    senderNumber: senderNumber,
                    isPremium: isPremium(senderNumber),
                    isSudo: isSudo(senderNumber),
                    isOwner: isOwner(senderNumber),
                    isSila: isSila(senderNumber),
                    addPremiumUser: addPremiumUser,
                    removePremiumUser: removePremiumUser,
                    getPremiumUsers: getPremiumUsers,
                    addSudoUser: addSudoUser,
                    removeSudoUser: removeSudoUser,
                    getSudoUsers: getSudoUsers,
                    addWarning: addWarning,
                    getWarnings: getWarnings,
                    resetWarnings: resetWarnings,
                    clearGroupWarnings: clearGroupWarnings,
                    silaConfig: silaConfig,
                    getFakeContact: silaConfig ? silaConfig.getFakeContact : null,
                    getContextInfo: (s) => silaConfig && silaConfig.getContextInfo ? silaConfig.getContextInfo(s || sender, botIdentity) : {},
                    getBotConfig: () => silaConfig ? silaConfig.getBotConfig() : botIdentity,
                    applyFont: silaConfig ? silaConfig.applyFont : smallFont,
                    getAvailableFonts: silaConfig ? silaConfig.getAvailableFonts : () => [],
                    setCurrentFont: silaConfig ? silaConfig.setCurrentFont : () => {},
                    updateBotName: silaConfig ? silaConfig.updateBotName : () => {},
                    updateCreator: silaConfig ? silaConfig.updateCreator : () => {},
                    updateSymbols: silaConfig ? silaConfig.updateSymbols : () => {},
                    updateFooter: silaConfig ? silaConfig.updateFooter : () => {},
                    updateNewsletter: silaConfig ? silaConfig.updateNewsletter : () => {},
                    updateStatus: silaConfig ? silaConfig.updateStatus : () => {},
                    updateEmojis: silaConfig ? silaConfig.updateEmojis : () => {},
                    resetToDefault: silaConfig ? silaConfig.resetToDefault : () => {},
                    getImage: silaConfig ? silaConfig.getImage : () => {},
                    setImage: silaConfig ? silaConfig.setImage : () => {},
                    getMessage: silaConfig ? silaConfig.getMessage : () => {},
                    setMessage: silaConfig ? silaConfig.setMessage : () => {},
                    formatSuccess: silaConfig ? silaConfig.formatSuccess : (t) => `✅ ${t}`,
                    formatError: silaConfig ? silaConfig.formatError : (t) => `❌ ${t}`,
                    formatWarning: silaConfig ? silaConfig.formatWarning : (t) => `⚠️ ${t}`,
                    getGroupSetting: getGroupSetting,
                    setGroupSetting: setGroupSetting,
                    isUserAdmin: isUserAdmin,
                    isUserMuted: isUserMuted
                })
            } catch (e) { 
                console.error(`Error executing command ${commandName}:`, e)
            }
        }
    })
}

// ==================== EXPRESS SERVER WITH SESSION GENERATOR ====================
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// HTML Page for session generation
const htmlPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>SILA-MD Session Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 30px;
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        button:active {
            transform: translateY(0);
        }
        .qr-container {
            margin-top: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 15px;
            display: none;
        }
        .qr-container.show {
            display: block;
        }
        .qr-code {
            background: white;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
            margin-bottom: 15px;
        }
        .qr-code img {
            width: 200px;
            height: 200px;
        }
        .status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
        }
        .status.loading {
            background: #fff3cd;
            color: #856404;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        .session-result {
            margin-top: 20px;
            text-align: left;
            display: none;
        }
        .session-result.show {
            display: block;
        }
        .session-box {
            background: #2d2d2d;
            color: #4ade80;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-bottom: 15px;
            max-height: 200px;
            overflow: auto;
        }
        .copy-btn {
            background: #28a745;
            margin-top: 10px;
        }
        .copy-btn:hover {
            background: #218838;
        }
        .note {
            margin-top: 20px;
            padding: 15px;
            background: #e7f3ff;
            border-radius: 10px;
            font-size: 12px;
            color: #004085;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
        }
        .loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
            vertical-align: middle;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌑 SILA-MD Session Generator</h1>
        <div class="subtitle">Generate your WhatsApp session for SILA-MD Bot</div>
        
        <div class="input-group">
            <label>📱 WhatsApp Number (Optional)</label>
            <input type="tel" id="phoneNumber" placeholder="255700000000">
        </div>
        
        <button id="generateBtn">🔗 Generate Session</button>
        
        <div class="qr-container" id="qrContainer">
            <div class="qr-code" id="qrCode"></div>
            <div class="status" id="status">⏳ Waiting for scan...</div>
        </div>
        
        <div class="session-result" id="sessionResult">
            <label>✅ Your Session ID:</label>
            <div class="session-box" id="sessionBox"></div>
            <button class="copy-btn" id="copyBtn">📋 Copy Session</button>
            <div class="note">
                <strong>📌 Important:</strong><br>
                1. Copy the session starting with <strong>sila~</strong><br>
                2. Add it to your config as SESSION_ID<br>
                3. Restart your bot
            </div>
        </div>
        
        <div class="footer">
            © 2024 SILA-MD | Secure WhatsApp Bot
        </div>
    </div>
    
    <script>
        let currentSessionId = null;
        
        document.getElementById('generateBtn').addEventListener('click', async () => {
            const phoneNumber = document.getElementById('phoneNumber').value;
            const btn = document.getElementById('generateBtn');
            const qrContainer = document.getElementById('qrContainer');
            const sessionResult = document.getElementById('sessionResult');
            
            btn.disabled = true;
            btn.textContent = '⏳ Generating...';
            qrContainer.classList.remove('show');
            sessionResult.classList.remove('show');
            
            try {
                const response = await fetch('/api/generate-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phoneNumber || null })
                });
                
                const data = await response.json();
                
                if (data.success && data.qr) {
                    qrContainer.classList.add('show');
                    document.getElementById('qrCode').innerHTML = `<img src="${data.qr}" alt="QR Code">`;
                    document.getElementById('status').innerHTML = '<span class="loader"></span> 📱 Scan this QR code with WhatsApp';
                    document.getElementById('status').className = 'status loading';
                    
                    // Poll for session completion
                    pollSession(data.sessionId);
                } else {
                    throw new Error(data.error || 'Failed to generate QR');
                }
            } catch (error) {
                alert('Error: ' + error.message);
                btn.disabled = false;
                btn.textContent = '🔗 Generate Session';
            }
        });
        
        async function pollSession(sessionId) {
            const statusDiv = document.getElementById('status');
            
            const interval = setInterval(async () => {
                try {
                    const response = await fetch('/api/check-session/' + sessionId);
                    const data = await response.json();
                    
                    if (data.status === 'completed') {
                        clearInterval(interval);
                        currentSessionId = data.session;
                        
                        statusDiv.innerHTML = '✅ Connected! Session generated successfully!';
                        statusDiv.className = 'status success';
                        
                        document.getElementById('sessionBox').textContent = data.session;
                        document.getElementById('sessionResult').classList.add('show');
                        document.getElementById('generateBtn').disabled = false;
                        document.getElementById('generateBtn').textContent = '🔗 Generate Session';
                        
                    } else if (data.status === 'error') {
                        clearInterval(interval);
                        statusDiv.innerHTML = '❌ ' + data.error;
                        statusDiv.className = 'status error';
                        document.getElementById('generateBtn').disabled = false;
                        document.getElementById('generateBtn').textContent = '🔗 Generate Session';
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 2000);
            
            // Timeout after 2 minutes
            setTimeout(() => {
                clearInterval(interval);
                if (!currentSessionId) {
                    statusDiv.innerHTML = '❌ Session generation timeout. Please try again.';
                    statusDiv.className = 'status error';
                    document.getElementById('generateBtn').disabled = false;
                    document.getElementById('generateBtn').textContent = '🔗 Generate Session';
                }
            }, 120000);
        }
        
        document.getElementById('copyBtn').addEventListener('click', () => {
            if (currentSessionId) {
                navigator.clipboard.writeText(currentSessionId);
                const copyBtn = document.getElementById('copyBtn');
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy Session';
                }, 2000);
            }
        });
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlPage)
})

// API: Generate new session
app.post('/api/generate-session', async (req, res) => {
    try {
        const { phoneNumber } = req.body
        const result = await generateNewSession(phoneNumber)
        res.json({ success: true, ...result })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
})

// API: Check session status
app.get('/api/check-session/:sessionId', (req, res) => {
    const session = tempSessions.get(req.params.sessionId)
    if (session) {
        if (session.status === 'completed') {
            res.json({ status: 'completed', session: session.session })
        } else if (session.status === 'waiting') {
            res.json({ status: 'waiting' })
        } else {
            res.json({ status: 'error', error: 'Session expired' })
        }
    } else {
        res.json({ status: 'error', error: 'Session not found' })
    }
})

// API: Get current bot session
app.get('/api/get-session', (req, res) => {
    const session = generateSessionBackup()
    if (session) {
        res.json({ success: true, session: session })
    } else {
        res.json({ success: false, message: 'No active session' })
    }
})

// API: Bot status
app.get('/api/status', (req, res) => {
    res.json({
        status: currentConn ? 'online' : 'offline',
        bot: botIdentity.botName,
        creator: botIdentity.creatorName,
        session: fs.existsSync('./sessions/creds.json') ? 'active' : 'missing',
        uptime: process.uptime()
    })
})

// Clean up old temp sessions every hour
setInterval(() => {
    const now = Date.now()
    for (const [id, session] of tempSessions.entries()) {
        if (now - session.createdAt > 300000) { // 5 minutes
            tempSessions.delete(id)
        }
    }
}, 3600000)

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Session Generator running on port ${port}`)
    console.log(`📍 Visit: http://localhost:${port}`)
})

// Start bot after server is ready
setTimeout(() => {
    loadNocturnalCommands()
    startNocturnalBot().catch((err) => {
        console.error('Fatal error starting bot:', err)
    })
}, 3000)

module.exports = {
    isPremium,
    isSudo,
    isOwner,
    isSila,
    smallFont,
    addWarning,
    getWarnings,
    resetWarnings,
    clearGroupWarnings,
    isUserMuted,
    getSession: () => generateSessionBackup()
}