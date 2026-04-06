// silatech/premiumcmd.js (Example of premium-only command)
module.exports = {
    silacmd: "premiumtest",
    alias: ["ptest"],
    category: "premium",
    description: "Test premium command (Premium only)",
    usage: "premiumtest",
    premium: true,  // Hii inafanya command iwe premium only
    function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isPremium }) => {
        await repondre(`✨ *Premium Feature!*\n\nWelcome premium user! You have access to exclusive features.\n\nYour number: wa.me/${senderNumber}`);
    }
};