// sila/premium.js
// Premium user management system

const fs = require('fs');
const path = require('path');

// Path for premium data
const premiumPath = './silatz/premium.json';

// Load premium users
function loadPremiumUsers() {
    try {
        if (!fs.existsSync(premiumPath)) {
            const dir = path.dirname(premiumPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(premiumPath, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(premiumPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading premium users:', err);
        return [];
    }
}

// Save premium users
function savePremiumUsers(users) {
    try {
        const dir = path.dirname(premiumPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(premiumPath, JSON.stringify(users, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving premium users:', err);
        return false;
    }
}

// Check if user is premium
function isPremium(number) {
    const users = loadPremiumUsers();
    return users.includes(number);
}

// Add premium user
function addPremiumUser(number) {
    const users = loadPremiumUsers();
    if (!users.includes(number)) {
        users.push(number);
        savePremiumUsers(users);
        return true;
    }
    return false;
}

// Remove premium user
function removePremiumUser(number) {
    const users = loadPremiumUsers();
    const index = users.indexOf(number);
    if (index !== -1) {
        users.splice(index, 1);
        savePremiumUsers(users);
        return true;
    }
    return false;
}

// Get all premium users
function getPremiumUsers() {
    return loadPremiumUsers();
}

// Check if command requires premium and user has access
function hasPremiumAccess(command, senderNumber, isOwner, isSudo) {
    // Owner and Sudo always have access (but can be overridden)
    if (isOwner || isSudo) return true;
    
    // Check if command requires premium
    if (command.premium) {
        return isPremium(senderNumber);
    }
    
    return true;
}

// Get premium expiry (for future use)
function getPremiumExpiry(number) {
    const expiryPath = './silatz/premium-expiry.json';
    try {
        if (fs.existsSync(expiryPath)) {
            const data = JSON.parse(fs.readFileSync(expiryPath));
            return data[number] || null;
        }
    } catch (e) {}
    return null;
}

// Set premium expiry (for future use)
function setPremiumExpiry(number, days) {
    const expiryPath = './silatz/premium-expiry.json';
    let expiry = {};
    try {
        if (fs.existsSync(expiryPath)) {
            expiry = JSON.parse(fs.readFileSync(expiryPath));
        }
    } catch (e) {}
    
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + days);
    expiry[number] = expireDate.toISOString();
    
    fs.writeFileSync(expiryPath, JSON.stringify(expiry, null, 2));
    return true;
}

module.exports = {
    loadPremiumUsers,
    savePremiumUsers,
    isPremium,
    addPremiumUser,
    removePremiumUser,
    getPremiumUsers,
    hasPremiumAccess,
    getPremiumExpiry,
    setPremiumExpiry,
    premiumPath
};