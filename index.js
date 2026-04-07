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
} = require('@whiskeysockets/baileys')

const P = require('pino')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const express = require("express")
const app = express()
const port = process.env.PORT || 9090
const qrcode = require('qrcode')
const bodyParser = require('body-parser')
const { Boom } = require('@hapi/boom')

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
    mainSymbol: "🌑",
    defaultPrefix: "."
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

// ==================== SESSION MANAGER ====================
const SESSION_DIR = './sessions'
const SESSION_FILE = path.join(SESSION_DIR, 'creds.json')
const BACKUP_DIR = './session_backups'
const SESSION_PREFIX = 'sila~'

if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })

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
        return prefixedSession
    }
    return null
}

function loadSessionFromId() {
    let sessionId = config.SESSION_ID
    
    if (!sessionId || sessionId.trim() === '') {
        console.log('❌ No SESSION_ID found in config')
        return false
    }
    
    console.log('📥 Loading session from SESSION_ID...')
    
    try {
        let sessionData = sessionId.trim()
        
        if (sessionData.startsWith(SESSION_PREFIX)) {
            sessionData = sessionData.substring(SESSION_PREFIX.length)
            console.log('✅ Removed sila~ prefix')
        }
        
        const compressedBuffer = Buffer.from(sessionData, 'base64')
        const zlib = require('zlib')
        const sessionBuffer = zlib.gunzipSync(compressedBuffer)
        
        fs.writeFileSync(SESSION_FILE, sessionBuffer)
        
        console.log(`✅ Session loaded successfully! (${(sessionBuffer.length / 1024).toFixed(2)} KB)`)
        return true
        
    } catch (err) {
        console.log('❌ Failed to load session:', err.message)
        return false
    }
}

// Auto backup session every 6 hours
setInterval(() => {
    if (fs.existsSync(SESSION_FILE)) {
        backupSession()
        generateSessionBackup()
        console.log('🔄 Auto session backup completed')
    }
}, 6 * 60 * 60 * 1000)

// ==================== TEMP SESSION STORAGE FOR QR ====================
let tempSessions = new Map()
let logEntries = []
let globalStats = {
    groups: 0,
    users: 0,
    blocks: 0,
    messages: 0,
    commands: 0
}

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
        }, 120000)
        
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
                
                await new Promise(resolve => setTimeout(resolve, 3000))
                
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

function addLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString()
    logEntries.unshift({ time, message, type })
    if (logEntries.length > 500) logEntries.pop()
    console.log(`[${type}] ${message}`)
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
}

function formatMemory(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

// ==================== RATE LIMITER ====================
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

// ==================== EXPRESS SERVER ====================
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// HTML Dashboard
const htmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SILA-TECH MD - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #fff;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { text-align: center; margin-bottom: 30px; color: #0066ff; }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(0,102,255,0.2);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            border: 1px solid rgba(0,102,255,0.3);
        }
        .stat-value { font-size: 2rem; font-weight: bold; color: #0066ff; }
        .stat-label { font-size: 0.8rem; color: #aaa; margin-top: 5px; }
        button {
            background: linear-gradient(135deg, #0066ff, #00ccff);
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        button:hover { opacity: 0.9; transform: translateY(-2px); }
        input, select {
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px;
            border-radius: 8px;
            color: white;
            width: 100%;
            margin-bottom: 10px;
        }
        .qr-code { text-align: center; margin: 20px 0; }
        .qr-code img { background: white; padding: 10px; border-radius: 10px; }
        .session-box {
            background: #0a0a0a;
            color: #00ff88;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 11px;
            word-break: break-all;
            margin: 10px 0;
        }
        .log-entry {
            padding: 5px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-size: 12px;
            font-family: monospace;
        }
        .log-entry.info { color: #00ccff; }
        .log-entry.success { color: #00ff88; }
        .log-entry.error { color: #ff4444; }
        .log-entry.warning { color: #ffaa00; }
        .logs-container {
            background: rgba(0,0,0,0.5);
            border-radius: 10px;
            padding: 10px;
            height: 300px;
            overflow-y: auto;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .tab-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
        }
        .tab-btn.active { background: #0066ff; }
        .panel { display: none; }
        .panel.active { display: block; }
        .status-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 5px;
        }
        .status-dot.online { background: #00ff88; box-shadow: 0 0 5px #00ff88; }
        .status-dot.offline { background: #ff4444; }
        @media (max-width: 768px) {
            .stats { grid-template-columns: repeat(2, 1fr); }
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌑 SILA-TECH MD Dashboard</h1>
        
        <div class="status-bar" style="text-align: center; margin-bottom: 20px;">
            <span class="status-dot" id="statusDot"></span>
            <span id="statusText">Checking...</span>
        </div>
        
        <div class="tabs">
            <button class="tab-btn active" onclick="showPanel('dashboard')">📊 Dashboard</button>
            <button class="tab-btn" onclick="showPanel('session')">📱 Session</button>
            <button class="tab-btn" onclick="showPanel('settings')">⚙️ Settings</button>
            <button class="tab-btn" onclick="showPanel('logs')">📜 Logs</button>
            <button class="tab-btn" onclick="showPanel('premium')">👑 Premium</button>
        </div>
        
        <!-- Dashboard Panel -->
        <div id="dashboard" class="panel active">
            <div class="stats" id="stats">
                <div class="stat-card"><div class="stat-value" id="groups">0</div><div class="stat-label">Groups</div></div>
                <div class="stat-card"><div class="stat-value" id="users">0</div><div class="stat-label">Users</div></div>
                <div class="stat-card"><div class="stat-value" id="uptime">0h</div><div class="stat-label">Uptime</div></div>
                <div class="stat-card"><div class="stat-value" id="memory">0 MB</div><div class="stat-label">Memory</div></div>
                <div class="stat-card"><div class="stat-value" id="blocks">0</div><div class="stat-label">Blocks</div></div>
                <div class="stat-card"><div class="stat-value" id="messages">0</div><div class="stat-label">Messages</div></div>
                <div class="stat-card"><div class="stat-value" id="premiumCount">0</div><div class="stat-label">Premium</div></div>
                <div class="stat-card"><div class="stat-value" id="commands">0</div><div class="stat-label">Commands</div></div>
            </div>
        </div>
        
        <!-- Session Panel -->
        <div id="session" class="panel">
            <div class="card">
                <h3>🔐 Generate New Session</h3>
                <input type="text" id="phoneNumber" placeholder="Phone Number (Optional)">
                <button onclick="generateSession()">Generate QR Code</button>
                <div id="qrContainer" style="display:none;" class="qr-code">
                    <div id="qrCode"></div>
                    <div id="sessionStatus"></div>
                </div>
                <div id="sessionResult" style="display:none;">
                    <div class="session-box" id="sessionBox"></div>
                    <button onclick="copySession()">📋 Copy Session</button>
                </div>
                <hr style="margin: 20px 0;">
                <h3>📱 Current Session</h3>
                <div class="session-box" id="currentSessionBox">Loading...</div>
            </div>
        </div>
        
        <!-- Settings Panel -->
        <div id="settings" class="panel">
            <div class="card">
                <h3>⚙️ Bot Settings</h3>
                <label>Prefix:</label>
                <input type="text" id="prefix" placeholder=".">
                <label>Mode:</label>
                <select id="mode">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="inbox">Inbox</option>
                    <option value="group">Group</option>
                    <option value="self">Self</option>
                </select>
                <label>Bot Name:</label>
                <input type="text" id="botName" placeholder="Bot Name">
                <button onclick="saveAllSettings()">Save All Settings</button>
                <button onclick="reloadSettings()">Reload</button>
            </div>
            
            <div class="card">
                <h3>🛡️ Security Features</h3>
                <label><input type="checkbox" id="antiLink"> Anti-Link</label>
                <label><input type="checkbox" id="antiCall"> Anti-Call</label>
                <label><input type="checkbox" id="antiDelete"> Anti-Delete</label>
                <label><input type="checkbox" id="antiBug"> Anti-Bug</label>
                <label><input type="checkbox" id="antiTag"> Anti-Tag</label>
                <label><input type="checkbox" id="antiViewOnce"> Anti-ViewOnce</label>
            </div>
            
            <div class="card">
                <h3>🤖 Auto Features</h3>
                <label><input type="checkbox" id="autoReact"> Auto React</label>
                <label><input type="checkbox" id="autoReply"> Auto Reply</label>
                <label><input type="checkbox" id="autoViewStatus"> Auto View Status</label>
                <label><input type="checkbox" id="autoLikeStatus"> Auto Like Status</label>
                <label><input type="checkbox" id="autoTyping"> Auto Typing</label>
                <label><input type="checkbox" id="autoRecording"> Auto Recording</label>
            </div>
        </div>
        
        <!-- Logs Panel -->
        <div id="logs" class="panel">
            <div class="card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <h3>📜 Real-Time Logs</h3>
                    <div>
                        <button onclick="clearLogs()">Clear</button>
                        <button onclick="exportLogs()">Export</button>
                    </div>
                </div>
                <div class="logs-container" id="logsContainer"></div>
            </div>
        </div>
        
        <!-- Premium Panel -->
        <div id="premium" class="panel">
            <div class="card">
                <h3>👑 Premium Users</h3>
                <input type="text" id="premiumNumber" placeholder="Phone Number">
                <button onclick="addPremiumUser()">Add Premium User</button>
                <div id="premiumList" style="margin-top: 15px;"></div>
            </div>
            <div class="card">
                <h3>🛡️ Sudo Users</h3>
                <input type="text" id="sudoNumber" placeholder="Phone Number">
                <button onclick="addSudoUser()">Add Sudo User</button>
                <div id="sudoList" style="margin-top: 15px;"></div>
            </div>
        </div>
    </div>
    
    <script>
        let currentSessionId = null;
        let pollingInterval = null;
        
        function showPanel(panel) {
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(panel).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
        
        async function fetchAPI(url, options = {}) {
            try {
                const res = await fetch(url, options);
                return await res.json();
            } catch(e) { console.error(e); return null; }
        }
        
        async function loadStats() {
            const data = await fetchAPI('/api/stats');
            if(data) {
                document.getElementById('groups').textContent = data.groups || 0;
                document.getElementById('users').textContent = data.users || 0;
                document.getElementById('uptime').textContent = data.uptime || '0h';
                document.getElementById('memory').textContent = data.memory || '0 MB';
                document.getElementById('blocks').textContent = data.blocks || 0;
                document.getElementById('messages').textContent = data.messages || 0;
                document.getElementById('premiumCount').textContent = data.premium || 0;
                document.getElementById('commands').textContent = data.commands || 0;
            }
        }
        
        async function loadStatus() {
            const data = await fetchAPI('/api/status');
            if(data) {
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');
                if(data.status === 'online') {
                    dot.className = 'status-dot online';
                    text.textContent = 'Online';
                } else {
                    dot.className = 'status-dot offline';
                    text.textContent = 'Offline';
                }
            }
        }
        
        async function loadSettings() {
            const data = await fetchAPI('/api/settings');
            if(data) {
                document.getElementById('prefix').value = data.prefix || '.';
                document.getElementById('mode').value = data.MODE || 'public';
                document.getElementById('botName').value = data.botname || 'SILA-TECH MD';
                document.getElementById('antiLink').checked = data.antilink || false;
                document.getElementById('antiCall').checked = data.anticall || false;
                document.getElementById('antiDelete').checked = data.antidelete_group || true;
                document.getElementById('antiBug').checked = data.antibug || true;
                document.getElementById('antiTag').checked = data.antitag || true;
                document.getElementById('antiViewOnce').checked = data.antiviewonce || true;
                document.getElementById('autoReact').checked = data.autoreact || false;
                document.getElementById('autoReply').checked = data.autoreply || false;
                document.getElementById('autoViewStatus').checked = data.autoviewstatus || false;
                document.getElementById('autoLikeStatus').checked = data.autolikestatus || false;
                document.getElementById('autoTyping').checked = data.autotyping || false;
                document.getElementById('autoRecording').checked = data.autorecording || false;
            }
        }
        
        async function saveAllSettings() {
            const settings = {
                prefix: document.getElementById('prefix').value,
                MODE: document.getElementById('mode').value,
                botname: document.getElementById('botName').value,
                antilink: document.getElementById('antiLink').checked,
                anticall: document.getElementById('antiCall').checked,
                antidelete_group: document.getElementById('antiDelete').checked,
                antibug: document.getElementById('antiBug').checked,
                antitag: document.getElementById('antiTag').checked,
                antiviewonce: document.getElementById('antiViewOnce').checked,
                autoreact: document.getElementById('autoReact').checked,
                autoreply: document.getElementById('autoReply').checked,
                autoviewstatus: document.getElementById('autoViewStatus').checked,
                autolikestatus: document.getElementById('autoLikeStatus').checked,
                autotyping: document.getElementById('autoTyping').checked,
                autorecording: document.getElementById('autoRecording').checked
            };
            const res = await fetchAPI('/api/settings/all', { method: 'POST', body: JSON.stringify(settings), headers: { 'Content-Type': 'application/json' } });
            if(res && res.success) alert('Settings saved!');
        }
        
        async function reloadSettings() { await loadSettings(); alert('Settings reloaded'); }
        
        async function loadLogs() {
            const data = await fetchAPI('/api/logs');
            if(data && data.logs) {
                const container = document.getElementById('logsContainer');
                container.innerHTML = data.logs.map(l => `<div class="log-entry ${l.type}">[${l.time}] ${l.message}</div>`).join('');
                container.scrollTop = container.scrollHeight;
            }
        }
        
        async function clearLogs() { await fetchAPI('/api/logs/clear', { method: 'POST' }); loadLogs(); }
        async function exportLogs() { window.open('/api/logs/export', '_blank'); }
        
        async function generateSession() {
            const btn = event.target;
            const phoneNumber = document.getElementById('phoneNumber').value;
            btn.disabled = true;
            btn.textContent = 'Generating...';
            document.getElementById('qrContainer').style.display = 'none';
            document.getElementById('sessionResult').style.display = 'none';
            if(pollingInterval) clearInterval(pollingInterval);
            
            const res = await fetchAPI('/api/generate-session', { method: 'POST', body: JSON.stringify({ phoneNumber: phoneNumber || null }), headers: { 'Content-Type': 'application/json' } });
            if(res && res.success && res.qr) {
                document.getElementById('qrContainer').style.display = 'block';
                document.getElementById('qrCode').innerHTML = `<img src="${res.qr}" style="width:200px;height:200px;">`;
                document.getElementById('sessionStatus').innerHTML = '📱 Scan this QR code with WhatsApp';
                currentSessionId = res.sessionId;
                startPolling(currentSessionId);
            } else {
                alert('Failed to generate QR');
                btn.disabled = false;
                btn.textContent = 'Generate QR Code';
            }
        }
        
        function startPolling(sessionId) {
            pollingInterval = setInterval(async () => {
                const res = await fetchAPI(`/api/check-session/${sessionId}`);
                if(res && res.status === 'completed') {
                    clearInterval(pollingInterval);
                    document.getElementById('sessionStatus').innerHTML = '✅ Connected! Session generated!';
                    document.getElementById('sessionBox').textContent = res.session;
                    document.getElementById('sessionResult').style.display = 'block';
                    document.getElementById('generateSessionBtn').disabled = false;
                    document.getElementById('generateSessionBtn').textContent = 'Generate QR Code';
                    loadCurrentSession();
                }
            }, 2000);
            setTimeout(() => {
                if(pollingInterval) {
                    clearInterval(pollingInterval);
                    document.getElementById('sessionStatus').innerHTML = '❌ Timeout';
                    document.getElementById('generateSessionBtn').disabled = false;
                    document.getElementById('generateSessionBtn').textContent = 'Generate QR Code';
                }
            }, 120000);
        }
        
        async function loadCurrentSession() {
            const res = await fetchAPI('/api/get-session');
            if(res && res.success && res.session) {
                document.getElementById('currentSessionBox').innerHTML = `<strong>Active Session:</strong><br>${res.session.substring(0, 100)}...`;
            } else {
                document.getElementById('currentSessionBox').innerHTML = '<strong>No active session</strong>';
            }
        }
        
        function copySession() {
            const session = document.getElementById('sessionBox').textContent;
            navigator.clipboard.writeText(session);
            alert('Session copied!');
        }
        
        async function addPremiumUser() {
            const number = document.getElementById('premiumNumber').value;
            if(!number) return alert('Enter number');
            await fetchAPI('/api/premium/add', { method: 'POST', body: JSON.stringify({ number }), headers: { 'Content-Type': 'application/json' } });
            loadPremiumList();
            document.getElementById('premiumNumber').value = '';
        }
        
        async function loadPremiumList() {
            const res = await fetchAPI('/api/premium/list');
            if(res && res.users) {
                document.getElementById('premiumList').innerHTML = res.users.map(u => `<div class="log-entry success">👑 ${u} <button onclick="removePremiumUser('${u}')" style="float:right">Remove</button></div>`).join('');
            }
        }
        
        async function removePremiumUser(number) {
            await fetchAPI('/api/premium/remove', { method: 'POST', body: JSON.stringify({ number }), headers: { 'Content-Type': 'application/json' } });
            loadPremiumList();
        }
        
        async function addSudoUser() {
            const number = document.getElementById('sudoNumber').value;
            if(!number) return alert('Enter number');
            await fetchAPI('/api/sudo/add', { method: 'POST', body: JSON.stringify({ number }), headers: { 'Content-Type': 'application/json' } });
            loadSudoList();
            document.getElementById('sudoNumber').value = '';
        }
        
        async function loadSudoList() {
            const res = await fetchAPI('/api/sudo/list');
            if(res && res.users) {
                document.getElementById('sudoList').innerHTML = res.users.map(u => `<div class="log-entry warning">🛡️ ${u} <button onclick="removeSudoUser('${u}')" style="float:right">Remove</button></div>`).join('');
            }
        }
        
        async function removeSudoUser(number) {
            await fetchAPI('/api/sudo/remove', { method: 'POST', body: JSON.stringify({ number }), headers: { 'Content-Type': 'application/json' } });
            loadSudoList();
        }
        
        setInterval(loadStats, 5000);
        setInterval(loadLogs, 3000);
        setInterval(loadStatus, 10000);
        
        loadStats();
        loadStatus();
        loadSettings();
        loadLogs();
        loadCurrentSession();
        loadPremiumList();
        loadSudoList();
    </script>
</body>
</html>`;

app.get('/', (req, res) => {
    res.send(htmlPage)
})

// ==================== API ENDPOINTS ====================
app.get('/api/stats', (req, res) => {
    res.json({
        groups: globalStats.groups || 0,
        users: globalStats.users || 0,
        uptime: formatUptime(process.uptime()),
        memory: formatMemory(process.memoryUsage().rss),
        blocks: globalStats.blocks || 0,
        messages: globalStats.messages || 0,
        premium: global.premiumUsers?.size || 0,
        commands: globalStats.commands || 0
    })
})

app.get('/api/status', (req, res) => {
    res.json({
        status: global.conn ? 'online' : 'offline',
        bot: botIdentity.botName,
        creator: botIdentity.creatorName,
        session: fs.existsSync(SESSION_FILE) ? 'active' : 'missing',
        uptime: process.uptime()
    })
})

app.get('/api/settings', (req, res) => {
    res.json(getSettings())
})

app.post('/api/settings', (req, res) => {
    const { key, value } = req.body
    const conf = getSettings()
    conf[key] = value
    saveSettings(conf)
    res.json({ success: true })
})

app.post('/api/settings/all', (req, res) => {
    saveSettings(req.body)
    res.json({ success: true })
})

app.get('/api/logs', (req, res) => {
    res.json({ logs: logEntries.slice(-100) })
})

app.post('/api/logs/clear', (req, res) => {
    logEntries = []
    res.json({ success: true })
})

app.get('/api/logs/export', (req, res) => {
    const content = logEntries.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n')
    res.setHeader('Content-Type', 'text/plain')
    res.send(content)
})

app.post('/api/generate-session', async (req, res) => {
    try {
        const { phoneNumber } = req.body
        const result = await generateNewSession(phoneNumber)
        res.json({ success: true, ...result })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
})

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

app.get('/api/get-session', (req, res) => {
    const session = generateSessionBackup()
    if (session) {
        res.json({ success: true, session: session })
    } else {
        res.json({ success: false, message: 'No active session' })
    }
})

app.get('/api/premium/list', (req, res) => {
    const users = getPremiumUsers()
    res.json({ users: users || [] })
})

app.post('/api/premium/add', (req, res) => {
    const { number } = req.body
    addPremiumUser(number)
    addLog(`Premium user added: ${number}`, 'success')
    res.json({ success: true })
})

app.post('/api/premium/remove', (req, res) => {
    const { number } = req.body
    removePremiumUser(number)
    addLog(`Premium user removed: ${number}`, 'warning')
    res.json({ success: true })
})

app.get('/api/sudo/list', (req, res) => {
    const users = getSudoUsers()
    res.json({ users: users || [] })
})

app.post('/api/sudo/add', (req, res) => {
    const { number } = req.body
    addSudoUser(number)
    addLog(`Sudo user added: ${number}`, 'success')
    res.json({ success: true })
})

app.post('/api/sudo/remove', (req, res) => {
    const { number } = req.body
    removeSudoUser(number)
    addLog(`Sudo user removed: ${number}`, 'warning')
    res.json({ success: true })
})

// Clean temp sessions
setInterval(() => {
    const now = Date.now()
    for (const [id, session] of tempSessions.entries()) {
        if (now - session.createdAt > 300000) {
            tempSessions.delete(id)
        }
    }
}, 3600000)

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Web server running on port ${port}`)
    console.log(`📍 Dashboard: http://localhost:${port}`)
    addLog(`Web server started on port ${port}`, 'success')
})

// ==================== MAIN BOT FUNCTION ====================
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

async function startNocturnalBot() {
    initializeSettings()
    await initializeDatabase()
    console.log('🛡️ AntiDelete database initialized')
    addLog('AntiDelete database initialized', 'success')
    
    if (!fs.existsSync(SESSION_FILE)) {
        if (!loadSessionFromId()) {
            console.log('⚠️ No valid session found. Please generate session from website first!')
            addLog('No valid session found. Please generate session from dashboard', 'warning')
            return
        }
    } else {
        console.log('✅ Existing session found, loading...')
        addLog('Existing session found, loading...', 'info')
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
    
    global.conn = sila
    
    sila.ev.on('creds.update', async () => {
        await saveCreds()
        backupSession()
        generateSessionBackup()
        addLog('Session credentials updated and backed up', 'info')
    })
    
    sila.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log('Connection closed:', reason)
            addLog(`Connection closed: ${reason}`, 'error')
            
            if (reason !== DisconnectReason.loggedOut) {
                reconnectAttempts++
                if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(5000 * reconnectAttempts, 30000)
                    console.log(`🔄 Reconnecting in ${delay/1000}s (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
                    addLog(`Reconnecting in ${delay/1000}s (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, 'warning')
                    setTimeout(startNocturnalBot, delay)
                } else {
                    console.log('❌ Max reconnection attempts reached. Please restart bot.')
                    addLog('Max reconnection attempts reached', 'error')
                }
            } else {
                console.log('🔓 Logged out. Please generate new session from website.')
                addLog('Logged out. Please generate new session from dashboard', 'error')
            }
        } else if (connection === 'open') {
            reconnectAttempts = 0
            addLog('Bot connected to WhatsApp successfully!', 'success')
            
            try {
                if (silaConfig) {
                    botIdentity = silaConfig.getBotConfig()
                }
            } catch (e) {}
            
            const conf = getSettings()
            console.log(smallFont(`🌑 ${botIdentity.botName} 🌑`))
            console.log(smallFont(`🚀 Bot is online!`))
            console.log(smallFont(`👤 Owner: ${config.OWNER_NUMBER}`))
            console.log(smallFont(`📌 Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}`))
            
            addLog(`${botIdentity.botName} is now online!`, 'success')
            
            try {
                const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`
                await sila.sendMessage(ownerJid, { 
                    text: smallFont(`🌑 ${botIdentity.botName} 🌑\n\n🤖 Bot connected!\n📌 Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}\n\n🛡️ All security features are active!`) 
                })
                console.log('✅ Test message sent to owner')
                addLog('Test message sent to owner', 'success')
            } catch (e) {
                console.error('❌ Failed to send test message:', e.message)
            }
        }
    })
    
    // Group events
    sila.ev.on('group-participants.update', async (update) => {
        await handleGroupEvents(sila, update, botIdentity, silaConfig)
        if (update.id) {
            try {
                const metadata = await sila.groupMetadata(update.id)
                globalStats.groups = 1
                globalStats.users = metadata.participants?.length || 0
            } catch (e) {}
        }
    })
    
    // Anti-call
    sila.ev.on('call', async (call) => {
        const conf = getSettings()
        if (conf.anticall) {
            await handleAntiCall(sila, call, conf)
            globalStats.blocks++
            addLog(`Anti-call triggered`, 'warning')
        }
    })
    
    // Anti-delete
    sila.ev.on('messages.update', async (updates) => {
        const conf = getSettings()
        for (const update of updates) {
            if (update.update?.message === null) {
                const store = await loadMessage(update.key.id)
                if (store && conf.antidelete_group) {
                    addLog(`Delete detected: ${update.key.id}`, 'warning')
                    await AntiDelete(sila, [update], config, smallFont, silaConfig)
                }
            }
        }
    })
    
    // Message handler
    sila.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        
        const from = msg.key.remoteJid
        const conf = getSettings()
        
        globalStats.messages++
        
        const senderKey = msg.key.participant || msg.key.remoteJid
        if (!messageRateLimiter.isAllowed(senderKey)) return
        
        await saveMessage(msg.key.id, {
            message: msg,
            jid: from,
            sender: msg.key.participant || msg.key.remoteJid
        }).catch(e => console.error('Error saving message:', e))
        
        const sender = msg.key.fromMe ? sila.user.id.split(':')[0] : msg.key.participant || msg.key.remoteJid
        const senderNumber = sender.split('@')[0]
        
        if (isUserMuted(sender) && !msg.key.fromMe && !isOwner(senderNumber) && !isSudo(senderNumber)) {
            await sila.sendMessage(from, { delete: msg.key })
            return
        }
        
        let isProtected = isOwner(senderNumber) || isSudo(senderNumber) || isSila(senderNumber)
        if (!isProtected && from.includes('g.us')) {
            isProtected = await isUserAdmin(sila, from, sender)
        }
        
        // Anti features
        if (!msg.key.fromMe && !isProtected) {
            if (conf.antibug) await handleAntiBug(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antispam) await handleAntiSpam(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antitag) await handleAntiTag(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antibadwords) await handleAntiBadWords(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antiviewonce) await handleAntiViewOnce(sila, msg, sender, senderNumber, config, silaConfig)
            if (conf.antiforward) await handleAntiForward(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antigrouplink) await handleAntiGroupLink(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antivirtex) await handleAntiVirtex(sila, from, msg, sender, senderNumber, conf, silaConfig)
            if (conf.antitagall) await handleAntiTagAll(sila, from, msg, sender, senderNumber, conf, silaConfig)
        }
        
        // Anti-link
        if (from.includes('g.us') && !msg.key.fromMe && !isProtected && conf.antilink && antilinkLib) {
            try {
                await antilinkLib.handleAntilink(sila, from, msg, sender, senderNumber, conf)
            } catch (e) {}
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
                const emojis = (config.STATUS_REACT_EMOJIS || '❤️').split(',')
                await sila.sendMessage('status@broadcast', { 
                    react: { text: emojis[0], key: msg.key } 
                }, { statusJidList: [participant] })
            }
            return
        }
        
        if (conf.autotyping) await sila.sendPresenceUpdate('composing', from)
        if (conf.autorecording) await sila.sendPresenceUpdate('recording', from)
        
        if (conf.autoreact && !msg.key.fromMe) {
            const emojis = (config.AUTO_REACT_EMOJIS || '❤️').split(',')
            await sila.sendMessage(from, { 
                react: { text: emojis[0], key: msg.key } 
            })
        }
        
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        
        if (conf.autoreply && !msg.key.fromMe && body.trim() !== "" && !body.startsWith(conf.prefix)) {
            await sila.sendMessage(from, { 
                text: smallFont(`> Thank you for your message! I'm currently online.`),
            }, { quoted: msg })
        }
        
        // Mode check
        const mode = conf.MODE || 'public'
        if (mode === 'private' && !isOwner(senderNumber) && !isSudo(senderNumber)) return
        if (mode === 'inbox' && from.includes('g.us')) return
        if (mode === 'group' && !from.includes('g.us')) return
        if (mode === 'self' && !msg.key.fromMe) return
        
        // Chatbot
        if (!msg.key.fromMe && body.trim() !== "" && !body.startsWith(conf.prefix) && handleChatbotMessage) {
            await handleChatbotMessage(sila, from, msg, botIdentity)
        }
        
        if (!body.startsWith(conf.prefix)) return
        
        const args = body.slice(conf.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()
        
        if (!commandRateLimiter.isAllowed(senderKey)) {
            await sila.sendMessage(from, { delete: msg.key })
            return
        }
        
        const cmd = global.silaCommands.get(commandName)
        if (cmd) {
            globalStats.commands++
            addLog(`Command executed: ${commandName} by ${senderNumber}`, 'info')
            
            try {
                const isAdminInGroup = from.includes('g.us') ? await isUserAdmin(sila, from, sender) : false
                const permCheck = await checkPermissions(cmd, from, sender, senderNumber, isAdminInGroup)
                
                if (!permCheck.allowed) {
                    return await sila.sendMessage(from, { text: smallFont(permCheck.message) }, { quoted: msg })
                }
                
                await cmd.function(from, sila, {
                    ms: msg,
                    repondre: async (teks) => {
                        return await sila.sendMessage(from, { text: smallFont(teks) }, { quoted: msg })
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

// Initialize
global.premiumUsers = new Set()
global.sudoUsers = new Set()

setTimeout(() => {
    loadNocturnalCommands()
    startNocturnalBot().catch((err) => {
        console.error('Fatal error starting bot:', err)
        addLog(`Fatal error: ${err.message}`, 'error')
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