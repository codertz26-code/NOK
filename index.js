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
let logEntries = []
let globalStats = {
    groups: 0,
    users: 0,
    blocks: 0,
    messages: 0,
    commands: 0
}

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

// Add log function
function addLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString()
    logEntries.unshift({ time, message, type })
    if (logEntries.length > 500) logEntries.pop()
    console.log(`[${type}] ${message}`)
}

// Format helpers
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
}

function formatMemory(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`
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

// ==================== EXPRESS SERVER SETUP ====================
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use('/css', express.static('public/css'))
app.use('/js', express.static('public/js'))
app.set('view engine', 'html')
app.set('views', './views')

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'))
})

// ==================== API ENDPOINTS ====================

// API: Get bot stats
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

// API: Get bot status
app.get('/api/status', (req, res) => {
    res.json({
        status: global.conn ? 'online' : 'offline',
        bot: botIdentity.botName,
        creator: botIdentity.creatorName,
        session: fs.existsSync(SESSION_FILE) ? 'active' : 'missing',
        uptime: process.uptime()
    })
})

// API: Get settings
app.get('/api/settings', (req, res) => {
    const conf = getSettings()
    res.json(conf)
})

// API: Update single setting
app.post('/api/settings', (req, res) => {
    const { key, value } = req.body
    const conf = getSettings()
    conf[key] = value
    saveSettings(conf)
    addLog(`Setting updated: ${key} = ${value}`, 'info')
    res.json({ success: true })
})

// API: Update all settings
app.post('/api/settings/all', (req, res) => {
    const settings = req.body
    saveSettings(settings)
    addLog('All settings updated', 'success')
    res.json({ success: true })
})

// API: Reset settings
app.post('/api/settings/reset', (req, res) => {
    initializeSettings()
    addLog('Settings reset to default', 'warning')
    res.json({ success: true })
})

// API: Get logs
app.get('/api/logs', (req, res) => {
    res.json({ logs: logEntries.slice(-100) })
})

// API: Clear logs
app.post('/api/logs/clear', (req, res) => {
    logEntries = []
    addLog('Logs cleared by user', 'warning')
    res.json({ success: true })
})

// API: Export logs
app.get('/api/logs/export', (req, res) => {
    const content = logEntries.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n')
    res.json({ content })
})

// API: Generate session
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

// API: Get current session
app.get('/api/get-session', (req, res) => {
    const session = generateSessionBackup()
    if (session) {
        res.json({ success: true, session: session })
    } else {
        res.json({ success: false, message: 'No active session' })
    }
})

// API: Premium users
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

// API: Sudo users
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

// Clean up old temp sessions every hour
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
let currentConn = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

async function startNocturnalBot() {
    initializeSettings()
    await initializeDatabase()
    console.log('🛡️ AntiDelete database initialized')
    addLog('AntiDelete database initialized', 'success')
    
    // Load session from SESSION_ID if creds doesn't exist
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
    
    currentConn = sila
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
                if (loadSessionFromId()) {
                    reconnectAttempts = 0
                    setTimeout(startNocturnalBot, 5000)
                }
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
            console.log(smallFont(`🎨 Creator: ${botIdentity.creatorName} (${botIdentity.creatorNumber})`))
            console.log(smallFont(`📌 Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}`))
            
            addLog(`${botIdentity.botName} is now online!`, 'success')
            addLog(`Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}`, 'info')
            
            try {
                const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`
                await sila.sendMessage(ownerJid, { 
                    text: smallFont(`🌑 ${botIdentity.botName} 🌑\n\n🤖 Bot connected!\n🎨 Creator: ${botIdentity.creatorName}\n📌 Mode: ${conf.MODE?.toUpperCase() || 'PUBLIC'}\n\n🛡️ All security features are active!`) 
                })
                console.log('✅ Test message sent to owner')
                addLog('Test message sent to owner', 'success')
            } catch (e) {
                console.error('❌ Failed to send test message:', e.message)
                addLog(`Failed to send test message: ${e.message}`, 'error')
            }
        }
    })
    
    // ==================== GROUP EVENTS HANDLER ====================
    sila.ev.on('group-participants.update', async (update) => {
        await handleGroupEvents(sila, update, botIdentity, silaConfig)
        // Update stats
        if (update.id) {
            try {
                const metadata = await sila.groupMetadata(update.id)
                globalStats.groups = 1 // Will be updated with actual count
                globalStats.users = metadata.participants?.length || 0
            } catch (e) {}
        }
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
            globalStats.blocks++
            addLog(`Anti-call triggered for ${call[0]?.from}`, 'warning')
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
                addLog(`Delete detected: ${update.key.id}`, 'warning')
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
        
        // Update message stats
        globalStats.messages++
        
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
                    globalStats.blocks++
                    addLog(`Antimedia: Deleted ${type} from ${senderNumber}`, 'warning')
                    
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
            globalStats.commands++
            addLog(`Command executed: ${commandName} by ${senderNumber}`, 'info')
            
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
                addLog(`Error executing command ${commandName}: ${e.message}`, 'error')
            }
        }
    })
}

// ==================== START BOT ====================
// Initialize global stores
global.premiumUsers = new Set()
global.sudoUsers = new Set()

// Load commands and start bot
setTimeout(() => {
    loadNocturnalCommands()
    startNocturnalBot().catch((err) => {
        console.error('Fatal error starting bot:', err)
        addLog(`Fatal error starting bot: ${err.message}`, 'error')
    })
}, 3000)

// ==================== EXPORTS ====================
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
    getSession: () => generateSessionBackup(),
    addLog
}