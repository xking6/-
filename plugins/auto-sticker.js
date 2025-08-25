const fs = require('fs');
const path = require('path');
const config = require('../settings');
const { malvin } = require('../malvin');

malvin({
  on: "body"
},
async (malvin, mek, m, { from, body }) => {
    const filePath = path.join(__dirname, '../autos/autosticker.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_STICKER === 'true') {
                const stickerPath = path.join(__dirname, '../autos/autosticker', data[text]);

                if (fs.existsSync(stickerPath)) {
                    const stickerBuffer = fs.readFileSync(stickerPath);

                    await malvin.sendMessage(from, {
                        sticker: stickerBuffer,
                        packname: 'MALVIN-XD',
                        author: 'ʟᴏʀᴅ ᴍᴋ'
                    }, { quoted: mek });
                } else {
                    console.warn(`Sticker not found: ${stickerPath}`);
                }
            }
        }
    }
});