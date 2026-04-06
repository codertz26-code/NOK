// ==================== UPLOAD HANDLERS ====================
// Weka hii file katika folder ya sila/upload.js

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const { ImageUploadService } = require("node-upload-images");
const fetch = require("node-fetch");

// Upload to tmpfiles.org
async function uploadToTmpFiles(buffer, fileName) {
    const formData = new FormData();
    formData.append('file', buffer, fileName);

    try {
        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.url) {
            let originalUrl = data.data.url;
            let parts = originalUrl.split('/');
            let fileId = parts[parts.length - 2];
            let name = parts[parts.length - 1];
            return `https://tmpfiles.org/dl/${fileId}/${name}`;
        } else {
            throw new Error('Upload failed - no URL returned');
        }
    } catch (err) {
        throw new Error('Upload failed: ' + err.message);
    }
}

// Upload to CatBox
async function CatBox(buffer) {
    try {
        const { ext } = await fromBuffer(buffer);
        const form = new FormData();
        form.append("fileToUpload", buffer, `file.${ext}`);
        form.append("reqtype", "fileupload");
        
        const res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: form
        });
        
        return await res.text();
    } catch {
        return null;
    }
}

// Upload to pixhost.to (primary)
async function uploadImageBuffer(buffer) {
    try {
        const service = new ImageUploadService("pixhost.to");
        const { directLink } = await service.uploadFromBinary(buffer, "image.png");
        return directLink || null;
    } catch {
        return null;
    }
}

// Fallback upload - try multiple services
async function uploadWithFallback(buffer, fileName = "file") {
    let url = null;
    let errors = [];

    // Try pixhost first
    try {
        url = await uploadImageBuffer(buffer);
        if (url) return { url, service: 'pixhost.to' };
    } catch (err) {
        errors.push(`pixhost: ${err.message}`);
    }

    // Try catbox
    try {
        url = await CatBox(buffer);
        if (url) return { url, service: 'catbox.moe' };
    } catch (err) {
        errors.push(`catbox: ${err.message}`);
    }

    // Try tmpfiles as last resort
    try {
        url = await uploadToTmpFiles(buffer, fileName);
        if (url) return { url, service: 'tmpfiles.org' };
    } catch (err) {
        errors.push(`tmpfiles: ${err.message}`);
    }

    throw new Error(`All upload services failed: ${errors.join(', ')}`);
}

module.exports = {
    uploadToTmpFiles,
    uploadImageBuffer,
    CatBox,
    uploadWithFallback
};
