// silatech/repo.js
const axios = require('axios');

module.exports = {
    silacmd: "repo",
    alias: ["repository", "github", "source"],
    category: "general",
    description: "Show bot repository info",
    usage: "repo",
    function: async (from, sila, { repondre, args, prefixe, botName }) => {
        
        const repoUrl = "https://github.com/Sila-Md/SILA-MD";
        const forkUrl = "https://github.com/Sila-Md/SILA-MD/fork";
        const imageUrl = "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800";
        
        try {
            // Fetch real-time data from GitHub API
            const response = await axios.get('https://api.github.com/repos/Sila-Md/SILA-MD');
            const repoData = response.data;
            
            const forks = repoData.forks_count;
            const stars = repoData.stargazers_count;
            const lastUpdate = new Date(repoData.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const caption = `╭━━━[ ♱ ${botName} ♱ ]━━━╮
┃
┃  📁 *Repository Info*
┃
┃  ⭐ *Stars:* ${stars}
┃  🍴 *Forks:* ${forks}
┃  🕐 *Last Update:* ${lastUpdate}
┃
┃  🔗 ${repoUrl}
┃
╰━━━━━━━━━━━━━━━━━━╯

♱ *Support us by starring!* ♱`;

            // Interactive buttons (Baileys v2 style)
            const buttons = [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👁️ View Repo',
                        url: repoUrl
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Copy Link',
                        copy_code: repoUrl
                    })
                }
            ];

            // Send message with interactive buttons
            await sila.sendMessage(from, {
                image: { url: imageUrl },
                caption: caption,
                footer: "♱ NOCTURNAL BOT ♱",
                buttons: buttons,
                headerType: 4,
                viewOnce: true,
                contextInfo: {
                    externalAdReply: {
                        title: botName,
                        body: "Official Repository",
                        thumbnailUrl: imageUrl,
                        sourceUrl: repoUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

        } catch (error) {
            console.error("Error fetching repo data:", error.message);
            
            // Fallback if API fails
            const caption = `╭━━━[ ♱ ${botName} ♱ ]━━━╮
┃
┃  📁 *Repository Info*
┃
┃  🔗 ${repoUrl}
┃
┃  ⚠️ Could not fetch live data
┃
╰━━━━━━━━━━━━━━━━━━╯

♱ *Click button to visit!* ♱`;

            const buttons = [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👁️ View Repo',
                        url: repoUrl
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Copy Link',
                        copy_code: repoUrl
                    })
                }
            ];

            await sila.sendMessage(from, {
                image: { url: imageUrl },
                caption: caption,
                footer: "♱ NOCTURNAL BOT ♱",
                buttons: buttons,
                headerType: 4,
                viewOnce: true
            });
        }
    }
};
