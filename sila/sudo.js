// sila/sudo.js
// Sudo user management system

const fs = require('fs');
const path = require('path');

// Path for sudo data
const sudoPath = './silatz/sudo.json';

// Load sudo users
function loadSudoUsers() {
    try {
        if (!fs.existsSync(sudoPath)) {
            const dir = path.dirname(sudoPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(sudoPath, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(sudoPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading sudo users:', err);
        return [];
    }
}

// Save sudo users
function saveSudoUsers(users) {
    try {
        const dir = path.dirname(sudoPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(sudoPath, JSON.stringify(users, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving sudo users:', err);
        return false;
    }
}

// Check if user is sudo
function isSudo(number) {
    const users = loadSudoUsers();
    return users.includes(number);
}

// Add sudo user
function addSudoUser(number) {
    const users = loadSudoUsers();
    if (!users.includes(number)) {
        users.push(number);
        saveSudoUsers(users);
        return true;
    }
    return false;
}

// Remove sudo user
function removeSudoUser(number) {
    const users = loadSudoUsers();
    const index = users.indexOf(number);
    if (index !== -1) {
        users.splice(index, 1);
        saveSudoUsers(users);
        return true;
    }
    return false;
}

// Get all sudo users
function getSudoUsers() {
    return loadSudoUsers();
}

// Check if user has sudo privileges (can use owner commands)
function hasSudoAccess(senderNumber, isOwner) {
    // Owner always has access
    if (isOwner) return true;
    
    // Check if user is sudo
    return isSudo(senderNumber);
}

// Check if user can bypass group restrictions (sudo can bypass)
function canBypassGroupRestrictions(senderNumber, isOwner) {
    return isOwner || isSudo(senderNumber);
}

module.exports = {
    loadSudoUsers,
    saveSudoUsers,
    isSudo,
    addSudoUser,
    removeSudoUser,
    getSudoUsers,
    hasSudoAccess,
    canBypassGroupRestrictions,
    sudoPath
};