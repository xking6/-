const axios = require("axios");
const { malvin } = require("../malvin");

malvin({
  pattern: "mediafire",
  alias: ["mfire", "mfdownload"],
  react: '📥',
  desc: "Download files from MediaFire",
  category: "download",
  use: ".mediafire <MediaFire URL>",
  filename: __filename
}, async (malvin, mek, m, { from, reply, args }) => {
  try {
    const url = args[0];
    if (!url || !url.includes("mediafire.com")) {
      return reply("❌ Please provide a valid MediaFire URL\nExample: .mediafire https://www.mediafire.com/file/...");
    }

    await malvin.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://apis.davidcyriltech.my.id/mediafire?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.downloadLink) {
      return reply("❌ Failed to fetch file info. Invalid URL or API error.");
    }

    await reply(`📥 Downloading File (${data.size})...`);

    const fileResponse = await axios.get(data.downloadLink, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(fileResponse.data);

    const messageOptions = {
      document: fileBuffer,
      fileName: data.fileName,
      mimetype: data.mimeType,
      caption: `
      
╭─[ ᴍᴇᴅɪᴀғɪʀᴇ ᴅʟ ]─
│
│📄 *size:* ${data.size}
╰─
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴠɪɴ ᴋɪɴɢ
      `
    };

    await malvin.sendMessage(from, messageOptions, { quoted: mek });
    await malvin.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error("MediaFire Error:", error);
    reply("❌ Failed to download file. Please try again later.");
    await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
