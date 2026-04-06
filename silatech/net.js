// silatech/net.js
module.exports = {
   silacmd: "net",
   alias: ["freenet", "silanet", "internet"],
   category: "general",
   description: "Show SILA FREE NET information",
   usage: "net",
   function: async (from, sila, { repondre, args, prefixe, botName }) => {
       
       const response = `███████╗██╗██╗      █████╗ 
██╔════╝██║██║     ██╔══██╗
███████╗██║██║     ███████║
╚════██║██║██║     ██╔══██║
███████║██║█████╗██║    ██║
╚══════╝╚═╝╚══════╝╚═╝  ╚═╝

♱ NOCTURNAL SYSTEM ♱
➤ SILA FREE NET ⚡
➤ POWERED BY SILA TECH

♱♱━[ ♱ ♱ ɴ o c т u r n a l ♱ ♱ ]━♱♱

🌐 *Available Networks:*
• Vodacom Free Browsing
• Airtel Free Net
• Tigo/Halotel tricks
• Zantel free mode

⚡ *Status:* Online & Active
🔮 *Type:* NOCTURNAL Premium

♱♱♱♱♱ 𝐏𝐨𝐰𝐞𝐝 𝐛𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡 ♱♱♱♱`;

       await repondre(response);
   }
};
