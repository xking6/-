const axios = require('axios');
const { malvin } = require('../malvin');

malvin({
    pattern: 'aivoice',
    alias: ['vai', 'voicex', 'voiceai'],
    react: '🔊',
    desc: 'convert text to ai voice 🎙️',
    category: 'convert',
    use: '.aivoice <text>',
    filename: __filename
}, async (malvin, mek, m, { from, args, reply, sender }) => {
    try {
        const inputText = args.join(' ');
        if (!inputText) {
            return reply('❌ please provide text\nexample: .aivoice hello world');
        }

        await malvin.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const voiceModels = [
            { number: '1', name: 'Hatsune Miku', model: 'miku' },
            { number: '2', name: 'Nahida (Exclusive)', model: 'nahida' },
            { number: '3', name: 'Nami', model: 'nami' },
            { number: '4', name: 'Ana (Female)', model: 'ana' },
            { number: '5', name: 'Optimus Prime', model: 'optimus_prime' },
            { number: '6', name: 'Goku', model: 'goku' },
            { number: '7', name: 'Taylor Swift', model: 'taylor_swift' },
            { number: '8', name: 'Elon Musk', model: 'elon_musk' },
            { number: '9', name: 'Mickey Mouse', model: 'mickey_mouse' },
            { number: '10', name: 'Kendrick Lamar', model: 'kendrick_lamar' },
            { number: '11', name: 'Angela Adkinsh', model: 'angela_adkinsh' },
            { number: '12', name: 'Eminem', model: 'eminem' }
        ];

        const menuText = voiceModels
            .map(model => `├ *${model.number}.* ${model.name}`)
            .join('\n');

        const caption = `
╭───[ *ᴀɪ ᴠᴏɪᴄᴇ ᴍᴏᴅᴇʟs* ]───
│
├ *ᴛᴇxᴛ*: ${inputText} 📝
│
${menuText}
│
├ 📌 *Reply with number to select voice*
╰───[ *ᴍᴀʟᴠɪɴ-xᴅ* ]───
> *powered by malvin* ♡`;

        const sentMsg = await malvin.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/medum3.jpg' },
            caption,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;
        let handlerActive = true;

        const handlerTimeout = setTimeout(async () => {
            handlerActive = false;
            malvin.ev.off('messages.upsert', messageHandler);
            await reply('❌ voice selection timed out ⏰\ntry again with .aivoice');
            await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
        }, 120000);

        const messageHandler = async (msgData) => {
            if (!handlerActive) return;

            const receivedMsg = msgData.messages[0];
            if (!receivedMsg || !receivedMsg.message) return;

            const receivedText = receivedMsg.message.conversation ||
                                receivedMsg.message.extendedTextMessage?.text ||
                                receivedMsg.message.buttonsResponseMessage?.selectedButtonId;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot && senderID === from) {
                clearTimeout(handlerTimeout);
                malvin.ev.off('messages.upsert', messageHandler);
                handlerActive = false;

                await malvin.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

                const selectedNumber = receivedText.trim();
                const selectedModel = voiceModels.find(model => model.number === selectedNumber);

                if (!selectedModel) {
                    await reply('❌ invalid voice number 😔\nreply with a number from the menu');
                    await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
                    return;
                }

                await malvin.sendMessage(from, {
                    text: `🔊 generating audio with *${selectedModel.name}* voice...`
                }, { quoted: receivedMsg });

                const apiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(inputText)}&model=${selectedModel.model}`;
                const { data } = await axios.get(apiUrl, { timeout: 30000 });

                if (data?.status === 200 && data?.data?.oss_url) {
                    await malvin.sendMessage(from, {
                        audio: { url: data.data.oss_url },
                        mimetype: 'audio/mpeg'
                    }, { quoted: receivedMsg });

                    await malvin.sendMessage(from, { react: { text: '✅', key: m.key } });
                } else {
                    await reply('❌ failed to generate audio 😞');
                    await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
                }
            }
        };

        malvin.ev.on('messages.upsert', messageHandler);

    } catch (error) {
        console.error('❌ aivoice error:', error);
        const errorMsg = error.message.includes('timeout')
            ? '❌ request timed out ⏰'
            : '❌ error processing request 😞';
        await reply(errorMsg);
        await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});