// silatz/antidel.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

const antidelPath = path.join(__dirname, 'antidel.json');

// Ensure directory exists
if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname, { recursive: true });
}

// Initialize antidel file if not exists
if (!fs.existsSync(antidelPath)) {
    fs.writeFileSync(antidelPath, JSON.stringify({ gc: false, dm: false }, null, 2));
}

// Load anti-delete settings
const getAnti = () => {
    try {
        if (fs.existsSync(antidelPath)) {
            return JSON.parse(fs.readFileSync(antidelPath));
        }
        return { gc: false, dm: false };
    } catch (err) {
        return { gc: false, dm: false };
    }
};

// Save anti-delete settings
const saveAnti = (data) => {
    fs.writeFileSync(antidelPath, JSON.stringify(data, null, 2));
};

// Set anti-delete status for specific type
const setAnti = (type, status) => {
    const settings = getAnti();
    settings[type] = status;
    saveAnti(settings);
    return true;
};

// Get anti-delete status for specific type
const getAntiStatus = (type) => {
    const settings = getAnti();
    return settings[type] || false;
};

// Initialize settings
const initializeAntiDeleteSettings = () => {
    if (!fs.existsSync(antidelPath)) {
        saveAnti({ gc: config.ANTI_DELETE || false, dm: config.ANTI_DELETE || false });
    }
    return true;
};

module.exports = {
    getAnti,
    saveAnti,
    setAnti,
    getAntiStatus,
    initializeAntiDeleteSettings,
    antidelPath
};