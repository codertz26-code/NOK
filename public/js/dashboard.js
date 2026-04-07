// ========== SILA-TECH MD DASHBOARD ==========
// Real-time Dashboard JavaScript

// Global variables
let currentSessionId = null;
let pollingInterval = null;
let statsInterval = null;
let logsInterval = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard initialized');
    
    initializeNavigation();
    initializeTabs();
    initializeSettingsTabs();
    initializeSessionGenerator();
    initializeEventListeners();
    
    // Start real-time updates
    loadBotStatus();
    loadStats();
    loadSettings();
    loadLogs();
    loadPremiumList();
    loadSudoList();
    loadCurrentSession();
    
    statsInterval = setInterval(loadStats, 5000);
    logsInterval = setInterval(loadLogs, 3000);
    setInterval(loadBotStatus, 10000);
});

// ========== NAVIGATION ==========
function initializeNavigation() {
    const navLinks = document.querySelectorAll('[data-tab]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            
            // Update panels
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(tab).classList.add('active');
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// ========== TABS ==========
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.settingTab;
            
            document.querySelectorAll('.setting-tab').forEach(t => {
                t.classList.remove('active');
            });
            document.getElementById(`${tab}-settings`).classList.add('active');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function initializeSettingsTabs() {
    const settingsBtns = document.querySelectorAll('.settings-tab-btn');
    settingsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.settingsTab;
            
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(`${tab}-panel`).classList.add('active');
            
            settingsBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {
    // Save buttons
    document.querySelectorAll('[onclick^="saveSetting"]').forEach(btn => {
        btn.removeAttribute('onclick');
    });
    
    // Add event listeners for all save buttons
    const saveButtons = document.querySelectorAll('.setting-card .btn-primary');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const settingId = btn.previousElementSibling?.querySelector('input')?.id || 
                              btn.previousElementSibling?.querySelector('select')?.id;
            if (settingId) saveSetting(settingId);
        });
    });
}

// ========== API CALLS ==========
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        showToast(`Request failed: ${error.message}`, 'error');
        return null;
    }
}

// ========== BOT STATUS ==========
async function loadBotStatus() {
    const data = await apiRequest('/api/status');
    if (data) {
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        
        if (data.status === 'online') {
            dot.className = 'status-dot online';
            text.textContent = 'Online';
        } else {
            dot.className = 'status-dot offline';
            text.textContent = 'Offline';
        }
    }
}

// ========== STATS ==========
async function loadStats() {
    const data = await apiRequest('/api/stats');
    if (data) {
        document.getElementById('groupsCount').textContent = data.groups || 0;
        document.getElementById('usersCount').textContent = data.users || 0;
        document.getElementById('uptime').textContent = data.uptime || '0h';
        document.getElementById('memory').textContent = data.memory || '0 MB';
        document.getElementById('antiCount').textContent = data.blocks || 0;
        document.getElementById('msgCount').textContent = data.messages || 0;
        document.getElementById('premiumCount').textContent = data.premium || 0;
        document.getElementById('cmdCount').textContent = data.commands || 0;
    }
}

// ========== SETTINGS ==========
async function loadSettings() {
    const data = await apiRequest('/api/settings');
    if (!data) return;
    
    // General settings
    setInputValue('prefix', data.prefix || '.');
    setSelectValue('mode', data.mode || 'public');
    setInputValue('botName', data.botName || 'SILA-TECH MD');
    
    // Security settings
    setCheckbox('antiLink', data.antiLink);
    setSelectValue('antiLinkAction', data.antiLinkAction || 'delete');
    setCheckbox('antiCall', data.antiCall);
    setCheckbox('antiDelete', data.antiDelete !== undefined ? data.antiDelete : true);
    setCheckbox('antiBug', data.antiBug !== undefined ? data.antiBug : true);
    setCheckbox('antiTag', data.antiTag !== undefined ? data.antiTag : true);
    setCheckbox('antiViewOnce', data.antiViewOnce !== undefined ? data.antiViewOnce : true);
    
    // Feature settings
    setCheckbox('autoReact', data.autoReact);
    setInputValue('autoReactEmojis', data.autoReactEmojis || '❤️,🔥,💯');
    setCheckbox('autoReply', data.autoReply !== undefined ? data.autoReply : true);
    setInputValue('autoReplyMsg', data.autoReplyMsg || 'I am currently online');
    setCheckbox('autoViewStatus', data.autoViewStatus !== undefined ? data.autoViewStatus : true);
    setCheckbox('autoLikeStatus', data.autoLikeStatus !== undefined ? data.autoLikeStatus : true);
    setCheckbox('autoTyping', data.autoTyping);
    setCheckbox('autoRecording', data.autoRecording);
    
    // Auto settings
    setCheckbox('autoBio', data.autoBio);
    setSelectValue('timeZone', data.timeZone || 'Africa/Dar_es_Salaam');
    setCheckbox('autoSticker', data.autoSticker);
    setInputValue('stickerName', data.stickerName || 'SILA-TECH MD');
    setCheckbox('welcome', data.welcome !== undefined ? data.welcome : true);
    setCheckbox('adminEvents', data.adminEvents !== undefined ? data.adminEvents : true);
    
    // Group settings
    setCheckbox('groupOnly', data.groupOnly);
    setCheckbox('mentionReply', data.mentionReply);
}

async function saveSetting(key) {
    let value;
    const element = document.getElementById(key);
    
    if (!element) {
        console.error(`Element not found: ${key}`);
        return;
    }
    
    if (element.type === 'checkbox') {
        value = element.checked;
    } else {
        value = element.value;
    }
    
    const data = await apiRequest('/api/settings', 'POST', { [key]: value });
    if (data && data.success) {
        showToast(`${key} saved successfully!`, 'success');
    } else {
        showToast(`Failed to save ${key}`, 'error');
    }
}

async function saveAllSettings() {
    const settings = {
        prefix: document.getElementById('prefix')?.value || '.',
        mode: document.getElementById('mode')?.value || 'public',
        botName: document.getElementById('botName')?.value || 'SILA-TECH MD',
        antiLink: document.getElementById('antiLink')?.checked || false,
        antiLinkAction: document.getElementById('antiLinkAction')?.value || 'delete',
        antiCall: document.getElementById('antiCall')?.checked || false,
        antiDelete: document.getElementById('antiDelete')?.checked || true,
        antiBug: document.getElementById('antiBug')?.checked || true,
        antiTag: document.getElementById('antiTag')?.checked || true,
        antiViewOnce: document.getElementById('antiViewOnce')?.checked || true,
        autoReact: document.getElementById('autoReact')?.checked || false,
        autoReactEmojis: document.getElementById('autoReactEmojis')?.value || '❤️,🔥,💯',
        autoReply: document.getElementById('autoReply')?.checked || true,
        autoReplyMsg: document.getElementById('autoReplyMsg')?.value || 'I am currently online',
        autoViewStatus: document.getElementById('autoViewStatus')?.checked || true,
        autoLikeStatus: document.getElementById('autoLikeStatus')?.checked || true,
        autoTyping: document.getElementById('autoTyping')?.checked || false,
        autoRecording: document.getElementById('autoRecording')?.checked || false,
        autoBio: document.getElementById('autoBio')?.checked || false,
        timeZone: document.getElementById('timeZone')?.value || 'Africa/Dar_es_Salaam',
        autoSticker: document.getElementById('autoSticker')?.checked || false,
        stickerName: document.getElementById('stickerName')?.value || 'SILA-TECH MD',
        welcome: document.getElementById('welcome')?.checked || true,
        adminEvents: document.getElementById('adminEvents')?.checked || true,
        groupOnly: document.getElementById('groupOnly')?.checked || false,
        mentionReply: document.getElementById('mentionReply')?.checked || false
    };
    
    const data = await apiRequest('/api/settings/all', 'POST', settings);
    if (data && data.success) {
        showToast('All settings saved successfully!', 'success');
    } else {
        showToast('Failed to save settings', 'error');
    }
}

async function reloadSettings() {
    await loadSettings();
    showToast('Settings reloaded', 'success');
}

async function resetSettings() {
    if (confirm('⚠️ Are you sure you want to reset ALL settings to default? This action cannot be undone.')) {
        const data = await apiRequest('/api/settings/reset', 'POST');
        if (data && data.success) {
            await loadSettings();
            showToast('Settings reset to default', 'success');
        } else {
            showToast('Failed to reset settings', 'error');
        }
    }
}

// ========== LOGS ==========
async function loadLogs() {
    const data = await apiRequest('/api/logs');
    if (data && data.logs) {
        const container = document.getElementById('logsContainer');
        if (container) {
            container.innerHTML = data.logs.map(log => 
                `<div class="log-entry ${log.type}">[${log.time}] ${escapeHtml(log.message)}</div>`
            ).join('');
            container.scrollTop = container.scrollHeight;
        }
    }
}

async function clearLogs() {
    const data = await apiRequest('/api/logs/clear', 'POST');
    if (data && data.success) {
        showToast('Logs cleared', 'success');
        await loadLogs();
    }
}

async function exportLogs() {
    const data = await apiRequest('/api/logs/export');
    if (data && data.content) {
        const blob = new Blob([data.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sila_logs_${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Logs exported', 'success');
    }
}

// ========== SESSION GENERATOR ==========
function initializeSessionGenerator() {
    const generateBtn = document.getElementById('generateSessionBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateSession);
    }
    
    const copyBtn = document.getElementById('copySessionBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copySession);
    }
}

async function generateSession() {
    const btn = document.getElementById('generateSessionBtn');
    const phoneNumber = document.getElementById('phoneNumber')?.value || '';
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    }
    
    const qrContainer = document.getElementById('qrContainer');
    const sessionResult = document.getElementById('sessionResult');
    
    if (qrContainer) qrContainer.style.display = 'none';
    if (sessionResult) sessionResult.style.display = 'none';
    
    if (pollingInterval) clearInterval(pollingInterval);
    
    const data = await apiRequest('/api/generate-session', 'POST', { phoneNumber: phoneNumber || null });
    
    if (data && data.success && data.qr) {
        if (qrContainer) {
            qrContainer.style.display = 'block';
            const qrCode = document.getElementById('qrCode');
            if (qrCode) {
                qrCode.innerHTML = `<img src="${data.qr}" alt="QR Code">`;
            }
            const statusDiv = document.getElementById('sessionStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '<span class="loader"></span> 📱 Scan this QR code with WhatsApp';
                statusDiv.className = 'status loading';
            }
        }
        
        currentSessionId = data.sessionId;
        startPolling(currentSessionId);
    } else {
        showToast('Failed to generate QR code', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plus-circle"></i> Generate New Session';
        }
    }
}

function startPolling(sessionId) {
    pollingInterval = setInterval(async () => {
        const data = await apiRequest(`/api/check-session/${sessionId}`);
        
        if (data && data.status === 'completed') {
            clearInterval(pollingInterval);
            pollingInterval = null;
            
            const statusDiv = document.getElementById('sessionStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '✅ Connected! Session generated successfully!';
                statusDiv.className = 'status success';
            }
            
            const sessionBox = document.getElementById('sessionBox');
            if (sessionBox) {
                sessionBox.textContent = data.session;
            }
            
            const sessionResult = document.getElementById('sessionResult');
            if (sessionResult) {
                sessionResult.style.display = 'block';
            }
            
            const generateBtn = document.getElementById('generateSessionBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Generate New Session';
            }
            
            showToast('Session generated successfully!', 'success');
            loadCurrentSession();
        }
    }, 2000);
    
    setTimeout(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            
            const statusDiv = document.getElementById('sessionStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '❌ Session generation timeout';
                statusDiv.className = 'status error';
            }
            
            const generateBtn = document.getElementById('generateSessionBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Generate New Session';
            }
        }
    }, 120000);
}

async function loadCurrentSession() {
    const data = await apiRequest('/api/get-session');
    const container = document.getElementById('currentSessionBox');
    
    if (container) {
        if (data && data.success && data.session) {
            container.innerHTML = `<strong>✅ Active Session:</strong><br>${escapeHtml(data.session.substring(0, 100))}...`;
        } else {
            container.innerHTML = '<strong>⚠️ No Active Session</strong><br>Generate a new session to start the bot';
        }
    }
}

function copySession() {
    const sessionBox = document.getElementById('sessionBox');
    if (sessionBox && sessionBox.textContent) {
        navigator.clipboard.writeText(sessionBox.textContent);
        showToast('Session copied to clipboard!', 'success');
    }
}

// ========== PREMIUM & SUDO MANAGEMENT ==========
async function addPremiumUser() {
    const number = document.getElementById('premiumNumber')?.value;
    if (!number) {
        showToast('Please enter a phone number', 'error');
        return;
    }
    
    const data = await apiRequest('/api/premium/add', 'POST', { number });
    if (data && data.success) {
        showToast(`Premium user ${number} added`, 'success');
        if (document.getElementById('premiumNumber')) {
            document.getElementById('premiumNumber').value = '';
        }
        await loadPremiumList();
    }
}

async function loadPremiumList() {
    const data = await apiRequest('/api/premium/list');
    const container = document.getElementById('premiumList');
    
    if (container) {
        if (data && data.users && data.users.length) {
            container.innerHTML = data.users.map(user => 
                `<div class="log-entry success">
                    <i class="fas fa-crown"></i> ${escapeHtml(user)}
                    <button onclick="removePremiumUser('${escapeHtml(user)}')" 
                            style="float:right; background:#ff4444; border:none; padding:2px 8px; border-radius:5px; cursor:pointer;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>`
            ).join('');
        } else {
            container.innerHTML = '<div class="log-entry">No premium users</div>';
        }
    }
}

async function removePremiumUser(number) {
    if (confirm(`Remove ${number} from premium users?`)) {
        const data = await apiRequest('/api/premium/remove', 'POST', { number });
        if (data && data.success) {
            showToast(`Premium user ${number} removed`, 'success');
            await loadPremiumList();
        }
    }
}

async function addSudoUser() {
    const number = document.getElementById('sudoNumber')?.value;
    if (!number) {
        showToast('Please enter a phone number', 'error');
        return;
    }
    
    const data = await apiRequest('/api/sudo/add', 'POST', { number });
    if (data && data.success) {
        showToast(`Sudo user ${number} added`, 'success');
        if (document.getElementById('sudoNumber')) {
            document.getElementById('sudoNumber').value = '';
        }
        await loadSudoList();
    }
}

async function loadSudoList() {
    const data = await apiRequest('/api/sudo/list');
    const container = document.getElementById('sudoList');
    
    if (container) {
        if (data && data.users && data.users.length) {
            container.innerHTML = data.users.map(user => 
                `<div class="log-entry warning">
                    <i class="fas fa-shield-alt"></i> ${escapeHtml(user)}
                    <button onclick="removeSudoUser('${escapeHtml(user)}')" 
                            style="float:right; background:#ff4444; border:none; padding:2px 8px; border-radius:5px; cursor:pointer;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>`
            ).join('');
        } else {
            container.innerHTML = '<div class="log-entry">No sudo users</div>';
        }
    }
}

async function removeSudoUser(number) {
    if (confirm(`Remove ${number} from sudo users?`)) {
        const data = await apiRequest('/api/sudo/remove', 'POST', { number });
        if (data && data.success) {
            showToast(`Sudo user ${number} removed`, 'success');
            await loadSudoList();
        }
    }
}

// ========== HELPER FUNCTIONS ==========
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function setCheckbox(id, value) {
    const element = document.getElementById(id);
    if (element) element.checked = value === true;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon}" style="color: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#0066ff'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========== EXPORT FUNCTIONS FOR GLOBAL ACCESS ==========
window.saveSetting = saveSetting;
window.saveAllSettings = saveAllSettings;
window.reloadSettings = reloadSettings;
window.resetSettings = resetSettings;
window.clearLogs = clearLogs;
window.exportLogs = exportLogs;
window.addPremiumUser = addPremiumUser;
window.removePremiumUser = removePremiumUser;
window.addSudoUser = addSudoUser;
window.removeSudoUser = removeSudoUser;
window.generateSession = generateSession;
window.copySession = copySession;
