const fetch = require('node-fetch');
const config = require('../settings');
const { malvin } = require('../malvin');
const fs = require('fs');

malvin({
    pattern: "repo",
    alias: ["sc", "script"],
    desc: "Fetch information about a GitHub repository.",
    react: "🪄",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/XdKing2/MALVIN-XD';

    try {
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        const repoData = await response.json();

        const formattedInfo = `

╭──〔 🚀 ᴍᴀʟᴠɪɴ xᴅ ʀᴇᴘᴏ 〕──
│
├─ 𖥸 *ɴᴀᴍᴇ*   : ${repoData.name}
├─ ⭐ *sᴛᴀʀs*    : ${repoData.stargazers_count}
├─ 🍴 *ғᴏʀᴋs*    : ${repoData.forks_count}
├─ 👑 *ᴏᴡɴᴇʀ*   : ᴍᴀʟᴠɪɴ ᴋɪɴɢ
├─ 📜 *ᴅᴇsᴄ* : ${repoData.description || 'No description available'}
├─ 🔗 *ʀᴇᴘᴏ ʟɪɴᴋ*  : ${repoUrl}
├─ 🧠 *sᴛᴀʀᴛ*     :  *${config.PREFIX}ᴍᴇɴᴜ* tᴏ ʙᴇɢɪɴ
│
╰──〔 *ᴅᴇᴠ ᴍᴀʟᴠɪɴ* 〕──

`;

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/01f9y1.jpg' },
            caption: formattedInfo,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JID || '120363402507750390@newsletter',
                    newsletterName: '🔥ᴍᴀʟᴠɪɴ-ʀᴇᴘᴏ🔥',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send audio intro
        await conn.sendMessage(from, {
      audio: { url: 'https://files.catbox.moe/z47dgd.mp3' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: mek });
    

    } catch (error) {
        console.error("❌ Error in repo command:", error);
        reply("⚠️ Failed to fetch repo info. Please try again later.");
    }
});
