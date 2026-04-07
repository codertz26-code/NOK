// ========== CHAT INTERFACE ==========

let currentChatJid = null;
let messageInterval = null;

function openChat(jid, name) {
    currentChatJid = jid;
    document.getElementById('chatModal').classList.add('active');
    document.getElementById('chatTitle').textContent = `Chat with ${name}`;
    loadChatMessages(jid);
    
    if (messageInterval) clearInterval(messageInterval);
    messageInterval = setInterval(() => loadChatMessages(jid), 3000);
}

async function loadChatMessages(jid) {
    const data = await apiRequest(`/api/chat/messages/${encodeURIComponent(jid)}`);
    if (data && data.messages) {
        const container = document.getElementById('chatMessages');
        container.innerHTML = data.messages.map(msg => `
            <div class="chat-message ${msg.fromMe ? 'sent' : 'received'}">
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-time">${msg.time}</div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text || !currentChatJid) return;
    
    const data = await apiRequest('/api/chat/send', 'POST', {
        jid: currentChatJid,
        text: text
    });
    
    if (data && data.success) {
        input.value = '';
        await loadChatMessages(currentChatJid);
    } else {
        showToast('Failed to send message', 'error');
    }
}

async function loadChats() {
    const data = await apiRequest('/api/chat/list');
    if (data && data.chats) {
        const container = document.getElementById('chatsList');
        container.innerHTML = data.chats.map(chat => `
            <div class="chat-item" onclick="openChat('${chat.jid}', '${escapeHtml(chat.name)}')">
                <img src="${chat.avatar || '/default-avatar.png'}" class="chat-avatar">
                <div class="chat-info">
                    <div class="chat-name">${escapeHtml(chat.name)}</div>
                    <div class="chat-last">${escapeHtml(chat.lastMessage || '')}</div>
                </div>
                <div class="chat-time">${chat.lastTime || ''}</div>
            </div>
        `).join('');
    }
}
