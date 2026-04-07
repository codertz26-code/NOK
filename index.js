console.clear()
console.log("📳 Starting NOCTURNAL-MD...")

// ============ GLOBAL ANTI-CRASH ============
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err)
})
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason)
})

// ES Module imports
import pkg from 'baileys'
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
} = pkg

import P from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import qrcode from 'qrcode'
import bodyParser from 'body-parser'
import { Boom } from '@hapi/boom'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import config
import config from './config.js'

// Load central bot configuration
let silaConfig = null
let botIdentity = null

try {
  const silaConfigModule = await import('./silamd/sila.js')
  silaConfig = silaConfigModule.default
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
} = await import('./data-json/index.js')

// Import sila modules
import antilinkLib from './sila/antilink.js'
import { 
  AntiDelete, 
  DeletedText, 
  DeletedMedia, 
  getMessageType,
  getOwnerJid 
} from './sila/antidelete.js'
import {
  AntiMedia,
  detectMediaType,
  shouldDeleteMedia,
  defaultAntiMediaTypes
} from './sila/antimedia.js'

// Import anti modules
import { handleAntiBug } from './sila/antibug.js'
import { handleAntiSpam } from './sila/antispam.js'
import { handleAntiTag } from './sila/antitag.js'
import { handleAntiFake } from './sila/antifake.js'
import { handleAntiBadWords } from './sila/antibadwords.js'
import { handleAntiViewOnce } from './sila/antiviewonce.js'
import { handleAntiForward } from './sila/antiforward.js'
import { handleAntiGroupLink } from './sila/antigrouplink.js'
import { handleAntiVirtex } from './sila/antivirtex.js'
import { handleAntiCall } from './sila/anticall.js'
import { handleAntiTagAll } from './sila/antitagall.js'
import { handleAntiMentionStatus } from './sila/antimentionstatus.js'
import { handleAntiEdit } from './sila/antiedit.js'

// Import group events handler
import { handleGroupEvents } from './sila/silaevents.js'

// Import chatbot handler
import { handleChatbotMessage } from './sila/chatbot.js'

// Import permission handlers
import premiumHandler from './sila/premium.js'
import sudoHandler from './sila/sudo.js'
import ownerHandler from './sila/owner.js'
import { checkPermissions, getUserLevel, getUserLevelEmoji } from './sila/permissions.js'

// Global variables
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
    }
}

function generateSessionBackup() {
    if (fs.existsSync(SESSION_FILE)) {
        const sessionBuffer = fs.readFileSync(SESSION_FILE)
        const zlib = await import('zlib')
        const compressedBuffer = zlib.gzipSync(sessionBuffer)
        const base64Session = compressedBuffer.toString('base64')
        return `${SESSION_PREFIX}${base64Session}`
    }
    return null
}

function loadSessionFromId() {
    let sessionId = config.SESSION_ID
    if (!sessionId || sessionId.trim() === '') return false
    
    try {
        let sessionData = sessionId.trim()
        if (sessionData.startsWith(SESSION_PREFIX)) {
            sessionData = sessionData.substring(SESSION_PREFIX.length)
        }
        const compressedBuffer = Buffer.from(sessionData, 'base64')
        const zlib = await import('zlib')
        const sessionBuffer = zlib.gunzipSync(compressedBuffer)
        fs.writeFileSync(SESSION_FILE, sessionBuffer)
        console.log(`✅ Session loaded successfully!`)
        return true
    } catch (err) {
        console.log('❌ Failed to load session:', err.message)
        return false
    }
}

// ==================== EXPRESS SERVER ====================
const app = express()
const port = process.env.PORT || 9090

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// Basic endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: botIdentity.botName,
        message: 'Bot is running! Visit /dashboard for full UI'
    })
})

// API endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: global.conn ? 'online' : 'offline',
        bot: botIdentity.botName,
        creator: botIdentity.creatorName,
        uptime: process.uptime()
    })
})

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Web server running on port ${port}`)
})

// ==================== MAIN BOT FUNCTION ====================
async function startNocturnalBot() {
    initializeSettings()
    await initializeDatabase()
    console.log('🛡️ AntiDelete database initialized')
    
    if (!fs.existsSync(SESSION_FILE)) {
        if (!loadSessionFromId()) {
            console.log('⚠️ No valid session found. Please set SESSION_ID in config')
            return
        }
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
        markOnlineOnConnect: true
    })
    
    global.conn = sila
    
    sila.ev.on('creds.update', saveCreds)
    
    sila.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log('Connection closed:', reason)
            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(startNocturnalBot, 5000)
            }
        } else if (connection === 'open') {
            console.log(smallFont(`🌑 ${botIdentity.botName} is online!`))
        }
    })
    
    // Message handler
    sila.ev.on('messages.upsert', async (m) => {
        // Basic message handling
        const msg = m.messages[0]
        if (!msg.message) return
        
        const from = msg.key.remoteJid
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        
        if (body === '.ping') {
            await sila.sendMessage(from, { text: '🏓 Pong!' })
        }
    })
}

// Start bot
startNocturnalBot().catch(console.error)

// Export functions
export {
    isPremium,
    isSudo,
    isOwner,
    isSila,
    smallFont,
    addWarning,
    getWarnings,
    resetWarnings,
    clearGroupWarnings,
    isUserMuted
}