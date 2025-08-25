const { malvin } = require('../malvin');
const axios = require('axios');

malvin({
    pattern: "metaai",
    alias: ["xeon", "meta"],
    react: "🤖",
    desc: "Talk with Meta AI",
    category: "ai",
    use: '.metaai <your question>',
    filename: __filename
},
async (malvin, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a question to ask Meta AI.");

        // React: Processing
        await malvin.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Show "typing" presence
        await malvin.sendPresenceUpdate("composing", from);

        // Fetch AI response
        const { data } = await axios.get(`https://apis.davidcyriltech.my.id/ai/metaai?text=${encodeURIComponent(q)}`);

        if (!data.success || !data.response) {
            await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Meta AI failed to respond.");
        }

        // React: Success
        await malvin.sendMessage(from, { react: { text: '✅', key: m.key } });

        // Reply with AI message
        await reply(`💬 *Meta AI:* ${data.response}`);

    } catch (e) {
        console.error("MetaAI Error:", e);
        await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ An error occurred while talking to Meta AI.");
    }
});
