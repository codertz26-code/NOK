// ========== SETTINGS MANAGEMENT ==========

// Group Settings
async function getGroupSettings(groupId) {
    return await apiRequest(`/api/group/${groupId}/settings`);
}

async function updateGroupSetting(groupId, feature, value) {
    return await apiRequest(`/api/group/${groupId}/settings`, 'POST', { feature, value });
}

async function toggleGroupFeature(groupId, feature) {
    const current = await getGroupSettings(groupId);
    const newValue = !current[feature];
    return await updateGroupSetting(groupId, feature, newValue);
}

// Anti-Spam Settings
async function updateAntiSpamSettings(settings) {
    return await apiRequest('/api/antispam/settings', 'POST', settings);
}

async function getAntiSpamStats() {
    return await apiRequest('/api/antispam/stats');
}

async function resetUserWarnings(groupId, userId) {
    return await apiRequest('/api/antispam/reset', 'POST', { groupId, userId });
}

// Anti-Media Settings
async function updateAntiMediaSettings(settings) {
    return await apiRequest('/api/antimedia/settings', 'POST', settings);
}

async function toggleMediaType(type, enabled) {
    return await apiRequest('/api/antimedia/type', 'POST', { type, enabled });
}

// Broadcast Settings
async function sendBroadcast(message, type = 'text') {
    return await apiRequest('/api/broadcast/send', 'POST', { message, type });
}

async function getBroadcastHistory() {
    return await apiRequest('/api/broadcast/history');
}

// Backup & Restore
async function createBackup() {
    return await apiRequest('/api/backup/create', 'POST');
}

async function restoreBackup(backupId) {
    return await apiRequest('/api/backup/restore', 'POST', { backupId });
}

async function listBackups() {
    return await apiRequest('/api/backup/list');
}

// Export settings
async function exportSettings() {
    const data = await apiRequest('/api/settings/export');
    if (data && data.content) {
        const blob = new Blob([JSON.stringify(data.content, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sila_settings_${new Date().toISOString().slice(0, 19)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Settings exported', 'success');
    }
}

// Import settings
async function importSettings(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const settings = JSON.parse(e.target.result);
        const data = await apiRequest('/api/settings/import', 'POST', settings);
        if (data && data.success) {
            showToast('Settings imported successfully', 'success');
            await loadSettings();
        }
    };
    reader.readAsText(file);
}
