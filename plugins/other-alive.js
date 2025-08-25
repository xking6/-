const config = require('../settings');
const axios = require('axios');
const { malvin, commands } = require('../malvin');

// ᴜᴛɪʟɪᴛʏ ꜰᴜɴᴄᴛɪᴏɴ ᴛᴏ ɢᴇᴛ ʀᴇꜱᴘᴏɴꜱᴇ ᴛɪᴍᴇ
const getResponseTime = (startTime) => {
  const diff = process.hrtime(startTime);
  return (diff[0] * 1000 + diff[1] / 1e6).toFixed(2); // ʀᴇᴛᴜʀɴꜱ ᴛɪᴍᴇ ɪɴ ᴍꜱ
};

malvin({
  pattern: "live",
  desc: "check if the bot is alive and operational",
  category: "main",
  react: "🟢",
  filename: __filename
},
async (malvin, mek, m, { from, sender, pushname, reply }) => {
  const startTime = process.hrtime(); // ꜱᴛᴀʀᴛ ᴛʀᴀᴄᴋɪɴɢ ʀᴇꜱᴘᴏɴꜱᴇ ᴛɪᴍᴇ
  try {
    // ᴅʏɴᴀᴍɪᴄ ᴄᴀᴘᴛɪᴏɴ ᴡɪᴛʜ ᴠᴇʀꜱɪᴏɴ ᴀɴᴅ ʀᴇꜱᴘᴏɴꜱᴇ ᴛɪᴍᴇ
    const caption = `
*ʜᴇʟʟᴏ ${pushname}! ɪ'ᴍ ᴀʟɪᴠᴇ ᴀɴᴅ ᴋɪᴄᴋɪɴɢ!*

╭──❍〘 ᴍᴀʟᴠɪɴ-xᴅ 〙
│ ✨ *ɴᴀᴍᴇ*: ᴍᴀʟᴠɪɴ-xᴅ
│ 👑 *ᴄʀᴇᴀᴛᴏʀ*: ᴍᴀʟᴠɪɴ ᴋɪɴɢ
│ ⚙️ *ᴠᴇʀꜱɪᴏɴ*: ${config.version || '1.5.0'}
│ 📂 *ꜱᴄʀɪᴘᴛ ᴛʏᴘᴇ*: ᴘʟᴜɢɪɴꜱ
│ 🕒 *ʀᴇꜱᴘᴏɴꜱᴇ ᴛɪᴍᴇ*: ${getResponseTime(startTime)} ᴍꜱ
╰──────────────⭑

🧠 ɪ'ᴍ ʏᴏᴜʀ ᴡʜᴀᴛꜱᴀᴘᴘ ᴀꜱꜱɪꜱᴛᴀɴᴛ ꜰᴏʀ ᴅᴀᴛᴀ ʀᴇᴛʀɪᴇᴠᴀʟ, ꜱᴇᴀʀᴄʜᴇꜱ, ᴀɴᴅ ᴍᴏʀᴇ!

*📜 ʀᴜʟᴇꜱ:*
1. 🚫 ɴᴏ ꜱᴘᴀᴍᴍɪɴɢ
2. 🚫 ɴᴏ ᴅɪʀᴇᴄᴛ ᴄᴀʟʟꜱ ᴛᴏ ᴛʜᴇ ʙᴏᴛ
3. 🚫 ɴᴏ ᴄᴏɴᴛᴀᴄᴛɪɴɢ ᴛʜᴇ ᴏᴡɴᴇʀ
4. 🚫 ɴᴏ ꜱᴘᴀᴍᴍɪɴɢ ᴛʜᴇ ᴏᴡɴᴇʀ

🔖 ᴛʏᴘᴇ *.ᴀʟʟᴍᴇɴᴜ* ᴛᴏ ᴇxᴘʟᴏʀᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ.

© ${new Date().getFullYear()} ᴍᴀʟᴠɪɴ ᴋɪɴɢ
    `.trim();

    // ᴠᴀʟɪᴅᴀᴛᴇ ɪᴍᴀɢᴇ ᴜʀʟ ʙᴇꜰᴏʀᴇ ꜱᴇɴᴅɪɴɢ
    const imageUrl = 'https://i.ibb.co/bgj9r6nP/malvin-xd.jpg';
    try {
      await axios.head(imageUrl); // ᴄʜᴇᴄᴋ ɪꜰ ɪᴍᴀɢᴇ ᴜʀʟ ɪꜱ ᴀᴄᴄᴇꜱꜱɪʙʟᴇ
    } catch (imgErr) {
      console.warn('ɪᴍᴀɢᴇ ᴜʀʟ ɪɴᴀᴄᴄᴇꜱꜱɪʙʟᴇ:', imgErr.message);
      return reply('⚠️ ᴜɴᴀʙʟᴇ ᴛᴏ ʟᴏᴀᴅ ʙᴏᴛ ɪᴍᴀɢᴇ. ʙᴏᴛ ɪꜱ ᴀʟɪᴠᴇ, ʙᴜᴛ ɪᴍᴀɢᴇ ᴅɪꜱᴘʟᴀʏ ꜰᴀɪʟᴇᴅ.');
    }

    // ꜱᴇɴᴅ ᴍᴇꜱꜱᴀɢᴇ ᴡɪᴛʜ ɪᴍᴀɢᴇ ᴀɴᴅ ᴄᴀᴘᴛɪᴏɴ
    await malvin.sendMessage(from, {
      image: { url: imageUrl },
      caption,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402507750390@newsletter',
          newsletterName: 'ᴍᴀʟᴠɪɴ ᴋɪɴɢ ᴛᴇᴄʜ',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (err) {
    // ɪᴍᴘʀᴏᴠᴇᴅ ᴇʀʀᴏʀ ʜᴀɴᴅʟɪɴɢ ᴡɪᴛʜ ꜱᴘᴇᴄɪꜰɪᴄ ᴍᴇꜱꜱᴀɢᴇꜱ
    console.error('ᴇʀʀᴏʀ ɪɴ ʟɪᴠᴇ ᴄᴏᴍᴍᴀɴᴅ:', err);
    const errorMessage = err.message.includes('network')
      ? '⚠️ ɴᴇᴛᴡᴏʀᴋ ɪꜱꜱᴜᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ. ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.'
      : `❌ ᴇʀʀᴏʀ: ${err.message}`;
    await reply(errorMessage);
  }
});