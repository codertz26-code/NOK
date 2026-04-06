// sila/owner.js
// Owner management system

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Owner numbers from config
const OWNER_NUMBER = config.OWNER_NUMBER;
const DEV_NUMBER = config.DEV;

// Check if user is owner
function isOwner(number) {
    return number === OWNER_NUMBER || number === DEV_NUMBER;
}

// Get owner JID
function getOwnerJid() {
    return `${OWNER_NUMBER}@s.whatsapp.net`;
}

// Get dev JID
function getDevJid() {
    return `${DEV_NUMBER}@s.whatsapp.net`;
}

// Get all owners
function getAllOwners() {
    return [OWNER_NUMBER, DEV_NUMBER];
}

// Check if user has owner privileges
function hasOwnerAccess(senderNumber) {
    return isOwner(senderNumber);
}

module.exports = {
    isOwner,
    getOwnerJid,
    getDevJid,
    getAllOwners,
    hasOwnerAccess,
    OWNER_NUMBER,
    DEV_NUMBER
};