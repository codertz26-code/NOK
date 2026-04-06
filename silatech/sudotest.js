// silatech/sudocmd.js (Example of sudo-only command)
module.exports = {
    silacmd: "sudotest",
    alias: ["stest"],
    category: "owner",
    description: "Test sudo command (Sudo only)",
    usage: "sudotest",
    sudo: true,  // Hii inafanya command iwe sudo only
    function: async (from, sila, { ms, repondre, args, prefixe, botName, senderNumber, isSudo }) => {
        await repondre(`⚡ *Sudo Feature!*\n\nWelcome sudo user! You are an assistant to the owner.\n\nYour number: wa.me/${senderNumber}`);
    }
};