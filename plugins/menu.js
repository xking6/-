const config = require('../settings');
const { malvin } = require('../malvin');
const { runtime } = require('../lib/functions');
const os = require('os');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment-timezone');

// Simple logging function
/**
 * Logs messages with timestamp and level
 * @param {string} level - Log level ('info', 'warn', 'error')
 * @param {string} message - Log message
 * @param {Error} [error] - Optional error object
 */
const log = (level, message, error = null) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, error ? `\n${error.stack}` : '');
};

// Validate URL
/**
 * Validates if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Common contextInfo for image messages
/**
 * @param {string} sender - The sender's JID
 * @param {object} config - Bot configuration
 * @returns {object} Context info for messages
 */
const getContextInfo = (sender, config) => ({
  mentionedJid: [sender],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: config.NEWSLETTER_JID || '120363402507750390@newsletter',
    newsletterName: config.OWNER_NAME || 'Malvin Tech 🪀',
    serverMessageId: 143,
  },
});

// Context info for audio messages (no newsletter)
/**
 * Creates context info for audio messages without newsletter
 * @param {string} sender - Sender's JID
 * @returns {object} Context info
 */
const getAudioContextInfo = (sender) => ({
  mentionedJid: [sender],
  forwardingScore: 999,
  isForwarded: true,
});

// Common function to send menu message
/**
 * @param {object} malvin - Malvin bot instance
 * @param {string} from - Chat ID
 * @param {object} mek - Message object
 * @param {string} caption - Menu caption
 * @param {string} imageUrl - Image URL
 * @param {object} contextInfo - Message context info
 */
const sendMenuMessage = async (malvin, from, mek, caption, imageUrl, contextInfo) => {
  if (!isValidUrl(imageUrl)) {
    log('warn', `Invalid image URL: ${imageUrl}`);
    imageUrl = 'https://files.catbox.moe/jw8h57.jpg'; // Fallback image
  }
  await malvin.sendMessage(
    from,
    {
      image: { url: imageUrl },
      caption,
      contextInfo,
    },
    { quoted: mek }
  );
};

// Common function to send audio message
/**
 * @param {object} malvin - Malvin bot instance
 * @param {string} from - Chat ID
 * @param {object} mek - Message object
 * @param {string} audioUrl - Audio URL
 * @param {object} contextInfo - Message context info
 */
const sendAudioMessage = async (malvin, from, mek, audioUrl, contextInfo) => {
  if (audioUrl && isValidUrl(audioUrl)) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for smoother UX
    await malvin.sendMessage(
      from,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mp4',
        ptt: true,
        contextInfo,
      },
      { quoted: mek }
    );
  } else if (audioUrl) {
    log('warn', `Invalid audio URL: ${audioUrl}`);
  }
};

// Common error handler
/**
 * @param {Error} error - Error object
 * @param {function} reply - Reply function
 * @param {string} menuName - Name of the menu
 */
const handleError = (error, reply, menuName) => {
  log('error', `${menuName} Error`, error);
  reply(`❌ Error: Failed to display ${menuName.toLowerCase()} menu. Please try again later.\n\nDetails: ${error.message}`);
};

// Common time info
/**
 * @param {string} timezone - Timezone for formatting
 * @returns {object} Time, date, platform, and uptime info
 */
const getTimeInfo = (timezone = config.TIMEZONE || 'Africa/Harare') => ({
  time: moment().tz(timezone).format('HH:mm:ss'),
  date: moment().tz(timezone).format('DD/MM/YYYY'),
  platform: os.platform(),
  uptime: runtime(process.uptime()),
});

// Paginate large menus
/**
 * @param {string} content - Menu content
 * @param {number} itemsPerPage - Number of items per page
 * @returns {string[]} Array of paginated content
 */
const paginateContent = (content, itemsPerPage = 20) => {
  const lines = content.split('\n');
  const pages = [];
  let currentPage = [];
  let itemCount = 0;

  for (const line of lines) {
    if (line.match(/^\s*│\s*[➸⬢✪⬩✷⊸➟]/)) {
      itemCount++;
    }
    currentPage.push(line);
    if (itemCount >= itemsPerPage && !line.startsWith('╰')) {
      pages.push(currentPage.join('\n'));
      currentPage = [lines[0]]; // Include header
      itemCount = 0;
    }
  }
  if (currentPage.length > 1) {
    pages.push(currentPage.join('\n'));
  }
  return pages;
};

// Placeholder for localization
/**
 * @param {string} content - Menu content
 * @param {string} lang - Language code
 * @returns {string} Localized content
 */
const localizeContent = (content, lang = 'en') => {
  // Future: Load translations from a JSON file or database
  return content;
};

// Menu definitions (unchanged from original)
const menus = {
  menu2: {
    pattern: 'menu2',
    desc: 'Show the bot main menu',
    category: 'menu',
    react: '⚡',
    content: ({ time, date, platform, uptime }) => `
┌──[ *${config.BOT_NAME}* ]──
│
│ 👑 Owner: ${config.OWNER_NAME}
│ ⚙️ Mode: ${config.MODE}
│ 💻 Platform: ${platform}
│ 🧩 Type: NodeJs (Multi Device)
│ 🕒 Time: ${time}
│ 📅 Date: ${date}
│ ⏳ Uptime: ${uptime}
│ 🔢 Prefix: ${config.PREFIX}
│ 🚀 Version: ${config.version}
│
├── *Categories* ──
│
│ • 📥 Download Menu
│ • 💬 Group Menu
│ • 🕹️ Fun Menu
│ • 👑 Owner Menu
│ • 🧠 AI Menu
│ • 🌸 Anime Menu
│ • 🔁 Convert Menu
│ • 🧩 Other Menu
│ • 💫 Reaction Menu
│ • 🏕️ Main Menu
│ • 🎨 Logo Menu
│ • ⚙️ Settings Menu
│ • 🎵 Audio Menu
│ • 🔒 Privacy Menu
│
└──
📌 Example: ${config.PREFIX}logomenu

 ${config.DESCRIPTION}
    `,
    imageKey: null,
    audioUrl: config.MENU_AUDIO_URL || null,
  },
  downloadmenu: {
    pattern: 'downloadmenu',
    alias: ['dlmenu', '1'],
    desc: 'Show the download menu',
    category: 'menu',
    react: '⤵️',
    content: () => `
╭═✦〔 📥 *Download Menu* 〕✦═╮
│
│ 🌐 *Social Media* 🌍
│ ➸ .fbdl
│ ➸ .igimagedl
│ ➸ .igvid
│ ➸ .pindl
│ ➸ .tiktok
│ ➸ .tiktok2
│ ➸ .twitter
│ ➸ .yt
│ ➸ .yt2
│ ➸ .ytpost
│ ➸ .yts
│
│ 💿 *Files & Apps* 💾
│ ➸ .apk
│ ➸ .gdrive
│ ➸ .gitclone
│ ➸ .mediafire
│ ➸ .mediafire2
│
│ 🎥 *Media Content* 📹
│ ➸ .getimage
│ ➸ .img
│ ➸ .movie
│ ➸ .moviedl
│ ➸ .music
│ ➸ .play
│ ➸ .series
│ ➸ .song
│ ➸ .tovideo
│ ➸ .tovideo2
│ ➸ .video2
│ ➸ .video3
│ ➸ .xvideo
│
│ 📖 *Misc* 📚
│ ➸ .bible
│ ➸ .biblelist
│ ➸ .news
│ ➸ .npm
│ ➸ .pair
│ ➸ .tts
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '1',
  },
  groupmenu: {
    pattern: 'groupmenu',
    alias: ['gmenu', '2'],
    desc: 'Show the group menu',
    category: 'menu',
    react: '⤵️',
    content: () => `
╭═✧〔 💬 *Group Menu* 〕✧═
│
│ 🔧 *Management* 🛠️
│ ⬢ .requestlist
│ ⬢ .acceptall
│ ⬢ .rejectall
│ ⬢ .removemembers
│ ⬢ .removeadmins
│ ⬢ .removeall2
│ ⬢ .groupsprivacy
│ ⬢ .updategdesc
│ ⬢ .updategname
│ ⬢ .revoke
│ ⬢ .ginfo
│ ⬢ .newgc
│
│ 👥 *Interaction* 🤝
│ ⬢ .join
│ ⬢ .invite
│ ⬢ .hidetag
│ ⬢ .tagall
│ ⬢ .tagadmins
│ ⬢ .poll
│ ⬢ .broadcast2
│
│ 🔒 *Security* 🛡️
│ ⬢ .lockgc
│ ⬢ .unlockgc
│ ⬢ .unmute
│ ⬢ .antilink
│ ⬢ .antilinkkick
│ ⬢ .deletelink
│ ⬢ .antibot
│ ⬢ .delete
│ ⬢ .closetime
│ ⬢ .opentime
│ ⬢ .notify
│
│ 👑 *Admin* 🧑‍💼
│ ⬢ .add
│ ⬢ .bulkdemote
│ ⬢ .demote
│ ⬢ .out
│ ⬢ .promote
│ ⬢ .remove
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '2',
  },
  funmenu: {
    pattern: 'funmenu',
    alias: ['fmenu', '3'],
    desc: 'Show the fun menu',
    category: 'menu',
    react: '😎',
    content: () => `
╭═✦〔 🕹️ *Fun Menu* 〕✦═╮
│
│ 🎲 *Games* 🎮
│ ✪ .8ball
│ ✪ .coinflip
│ ✪ .guessnumber
│ ✪ .rps
│ ✪ .tictactoe
│ ✪ .truth
│ ✪ .dare
│ ✪ .quiz
│ ✪ .roll
│
│ 😄 *Social* 💖
│ ✪ .angry
│ ✪ .compliment
│ ✪ .confused
│ ✪ .cute
│ ✪ .flirt
│ ✪ .happy
│ ✪ .heart
│ ✪ .kiss
│ ✪ .lovetest
│ ✪ .loveyou
│ ✪ .sad
│ ✪ .shy
│ ✪ .couplepp
│ ✪ .ship
│
│ 🔥 *Entertainment* 🎉
│ ✪ .animequote
│ ✪ .didyouknow
│ ✪ .fact
│ ✪ .joke
│ ✪ .pickupline
│ ✪ .quote
│ ✪ .quoteimage
│ ✪ .spamjoke
│
│ 🎨 *Creative* 🖌️
│ ✪ .aura
│ ✪ .character
│ ✪ .emoji
│ ✪ .emix
│ ✪ .fancy
│ ✪ .rcolor
│ ✪ .ringtone
│
│ ⚙️ *Misc* 🛠️
│ ✪ .compatibility
│ ✪ .count
│ ✪ .countx
│ ✪ .flip
│ ✪ .hack
│ ✪ .hot
│ ✪ .konami
│ ✪ .marige
│ ✪ .moon
│ ✪ .nikal
│ ✪ .pick
│ ✪ .pray4me
│ ✪ .rate
│ ✪ .remind
│ ✪ .repeat
│ ✪ .rw
│ ✪ .send
│ ✪ .shapar
│ ✪ .shout
│ ✪ .squidgame
│ ✪ .suspension
│
│ 🔞 *NSFW* 🚫
│ ✪ .anal
│ ✪ .ejaculation
│ ✪ .erec
│ ✪ .nsfw
│ ✪ .nude
│ ✪ .orgasm
│ ✪ .penis
│ ✪ .sex
│ ✪ .suspension
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '3',
    paginate: true,
  },
  ownermenu: {
    pattern: 'ownermenu',
    alias: ['omenu', '4'],
    desc: 'Show the owner menu',
    category: 'menu',
    react: '🔰',
    content: () => `
╭═✧〔 👑 *Owner Menu* 〕✧═╮
│
│ 🔧 *Bot Management* 🛠️
│ ➟ .admin
│ ➟ .setbotimage
│ ➟ .setbotname
│ ➟ .setownername
│ ➟ .setreacts
│ ➟ .shutdown
│ ➟ .restart
│ ➟ .update
│ ➟ .dev
│ ➟ .delsudo
│ ➟ .setsudo
│ ➟ .listsudo
│
│ 🚫 *User Control* 🚷
│ ➟ .ban
│ ➟ .unban
│ ➟ .block
│ ➟ .unblock
│ ➟ .listban
│
│ 📢 *Communication* 📣
│ ➟ .broadcast
│ ➟ .channelreact
│ ➟ .forward
│ ➟ .msg
│ ➟ .post
│
│ 🔍 *Information* 🔎
│ ➟ .getpp
│ ➟ .getprivacy
│ ➟ .gjid
│ ➟ .jid
│ ➟ .person
│ ➟ .savecontact
│
│ 🎨 *Content* 🖼️
│ ➟ .pp
│ ➟ .sticker
│ ➟ .take
│ ➟ .dailyfact
│
│ 🔐 *Security* 🛡️
│ ➟ .anti-call
│ ➟ .clearchats
│
│ ⚙️ *Misc* 🛠️
│ ➟ .leave
│ ➟ .vv
│ ➟ .vv2
│ ➟ .vv4
│
╰═══❒

> ${config.DESCRIPTION}
    `,
    imageKey: '4',
  },
  aimenu: {
    pattern: 'aimenu',
    alias: ['aimenu', '5'],
    desc: 'Show the AI menu',
    category: 'menu',
    react: '🤖',
    content: () => `
╭═✦〔 🧠 *AI Menu* 〕✦═╮
│
│ 🤖 *AI Models* 🧠
│ ⬣ .ai
│ ⬣ .deepseek
│ ⬣ .fluxai
│ ⬣ .llama3
│ ⬣ .malvin
│ ⬣ .metaai
│ ⬣ .openai
│ ⬣ .stabilityai
│ ⬣ .stablediffusion
│
╰═✨🌟🌟🌟🌟✨═╯

> ${config.DESCRIPTION}
    `,
    imageKey: '5',
  },
  animemenu: {
    pattern: 'animemenu',
    alias: ['anmenu', '6'],
    desc: 'Show the anime menu',
    category: 'menu',
    react: '🧚',
    content: () => `
╭═✧〔 🌸 *Anime Menu* 〕✧═╮
│
│ 🌸 *Characters* 🎀
│ ⊸ .animegirl
│ ⊸ .animegirl1
│ ⊸ .animegirl2
│ ⊸ .animegirl3
│ ⊸ .animegirl4
│ ⊸ .animegirl5
│ ⊸ .megumin
│ ⊸ .neko
│ ⊸ .waifu
│
│ 😺 *Animals* 🐾
│ ⊸ .awoo
│ ⊸ .cat
│ ⊸ .dog
│
│ 👗 *Cosplay* 👘
│ ⊸ .garl
│ ⊸ .maid
│
╰═══❒

> ${config.DESCRIPTION}
    `,
    imageKey: '6',
  },
  convertmenu: {
    pattern: 'convertmenu',
    alias: ['cmenu', '7'],
    desc: 'Show the convert menu',
    category: 'menu',
    react: '🥀',
    content: () => `
╭═✦〔 🔁 *Convert Menu* 〕✦═╮
│
│ 🖼️ *Images* 📸
│ ✷ .blur
│ ✷ .grey
│ ✷ .imgjoke
│ ✷ .invert
│ ✷ .jail
│ ✷ .nokia
│ ✷ .rmbg
│ ✷ .wanted
│
│ 🎙️ *Audio* 🎵
│ ✷ .aivoice
│ ✷ .tomp3
│ ✷ .toptt
│ ✷ .tts2
│ ✷ .tts3
│
│ 📄 *Files* 📑
│ ✷ .convert
│ ✷ .topdf
│ ✷ .vsticker
│
│ 🔗 *Utility* 🔧
│ ✷ .ad
│ ✷ .attp
│ ✷ .readmore
│ ✷ .tinyurl
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '7',
  },
  othermenu: {
    pattern: 'othermenu',
    alias: ['otmenu', '8'],
    desc: 'Show the other menu',
    category: 'menu',
    react: '🤖',
    content: () => `
╭═✧〔 🧩 *Other Menu* 〕✧═╮
│
│ 🔍 *Info* 📚
│ ├─ .countryinfo
│ ├─ .define
│ ├─ .weather
│ ├─ .wikipedia
│
│ 🌐 *Stalking* 🌍
│ ├─ .tiktokstalk
│ ├─ .xstalk
│ ├─ .ytstalk
│ ├─ .githubstalk
│
│ 🔐 *Coding* 💻
│ ├─ .base64
│ ├─ .unbase64
│ ├─ .binary
│ ├─ .dbinary
│ ├─ .urlencode
│ ├─ .urldecode
│
│ ⚙️ *Utilities* 🛠️
│ ├─ .calculate
│ ├─ .caption
│ ├─ .checkmail
│ ├─ .createapi
│ ├─ .gpass
│ ├─ .imgscan
│ ├─ .npm
│ ├─ .otpbox
│ ├─ .srepo
│ ├─ .tempmail
│ ├─ .tempnum
│ ├─ .trt
│ ├─ .vcc
│ ├─ .wastalk
│ ├─ .cancelallreminders
│ ├─ .cancelreminder
│ ├─ .check
│ ├─ .myreminders
│ ├─ .reminder
│ ├─ .tourl
│
│ 📸 *Images* 🖼️
│ ├─ .remini
│ ├─ .screenshot
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '8',
  },
  reactions: {
    pattern: 'reactions',
    alias: ['reactionsmenu', '9'],
    desc: 'Show the reaction menu',
    category: 'menu',
    react: '💫',
    content: () => `
╭═✦〔 💫 *Reaction Menu* 〕✦═╮
│
│ 😄 *Positive* 💖
│ ⬩ .blush
│ ⬩ .cuddle
│ ⬩ .happy
│ ⬩ .highfive
│ ⬩ .hug
│ ⬩ .kiss
│ ⬩ .lick
│ ⬩ .nom
│ ⬩ .pat
│ ⬩ .smile
│ ⬩ .wave
│
│ 😺 *Playful* 🎉
│ ⬩ .awoo
│ ⬩ .dance
│ ⬩ .glomp
│ ⬩ .handhold
│ ⬩ .poke
│ ⬩ .wink
│
│ 😈 *Teasing* 😜
│ ⬩ .bite
│ ⬩ .bonk
│ ⬩ .bully
│ ⬩ .cringe
│ ⬩ .cry
│ ⬩ .kill
│ ⬩}
│ ⬩ .slap
│ ⬩ .smug
│ ⬩ .yeet
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '9',
  },
  mainmenu: {
    pattern: 'mainmenu',
    alias: ['mmenu', '10'],
    desc: 'Show the main menu',
    category: 'menu',
    react: '🗿',
    content: () => `
╭═✧〔 🏕️ *Main Menu* 〕✧═╮
│
│ 🤖 *Status* 📊
│ ⊹ .alive
│ ⊹ .alive2
│ ⊹ .online
│ ⊹ .ping
│ ⊹ .ping2
│ ⊹ .uptime
│ ⊹ .version
│
│ 📅 *System* ⏰
│ ⊹ .date
│ ⊹ .time
│
│ 📚 *Info* ℹ️
│ ⊹ .bothosting
│ ⊹ .env
│ ⊹ .fetch
│ ⊹ .repo
│ ⊹ .support
│
│ 🆘 *Help* ❓
│ ⊹ .help
│ ⊹ .menu
│ ⊹ .menu2
│ ⊹ .menu3
│ ⊹ .list
│ ⊹ .report
│
│ 👤 *Owner* 👑
│ ⊹ .owner
│
╰═══❒

> ${config.DESCRIPTION}
    `,
    imageKey: '10',
  },
  logo: {
    pattern: 'logo',
    alias: ['logomenu', '11'],
    desc: 'Show the logo maker menu',
    category: 'menu',
    react: '🧃',
    content: () => `
╭═✦〔 🎨 *Logo Maker* 〕✦═╮
│
│ 🎨 *Themes* 🌟
│ ⬢ .america
│ ⬢ .blackpink
│ ⬢ .naruto
│ ⬢ .nigeria
│ ⬢ .pornhub
│ ⬢ .sadgirl
│ ⬢ .thor
│ ⬢ .zodiac
│
│ ✨ *Effects* 💥
│ ⬢ .3dcomic
│ ⬢ .3dpaper
│ ⬢ .boom
│ ⬢ .bulb
│ ⬢ .clouds
│ ⬢ .frozen
│ ⬢ .futuristic
│ ⬢ .galaxy
│ ⬢ .luxury
│ ⬢ .neonlight
│ ⬢ .sunset
│ ⬢ .typography
│ ⬢ .ytlogo
│
│ 🦁 *Characters* 🐾
│ ⬢ .angelwings
│ ⬢ .bear
│ ⬢ .cat
│ ⬢ .deadpool
│ ⬢ .devilwings
│ ⬢ .dragonball
│ ⬢ .sans
│
│ 🖌️ *Creative* 🎨
│ ⬢ .birthday
│ ⬢ .castle
│ ⬢ .eraser
│ ⬢ .hacker
│ ⬢ .leaf
│ ⬢ .paint
│ ⬢ .tatoo
│
╰══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '11',
  },
  settingsmenu: {
    pattern: 'settingsmenu',
    alias: ['smenu', '12'],
    desc: 'Show all bot configuration settings',
    category: 'owner',
    react: '⚙️',
    content: () => `
╭═✧〔 ⚙️ *Settings Menu* 〕✧═╮
│
│ 🤖 *Behavior* 🤖
│ ➢ .aichat
│ ➢ .auto-react
│ ➢ .auto-recording
│ ➢ .auto-reply
│ ➢ .auto-seen
│ ➢ .auto-sticker
│ ➢ .auto-typing
│ ➢ .auto-voice
│ ➢ .customreact
│ ➢ .fakerecording
│ ➢ .faketyping
│ ➢ .heartreact
│ ➢ .ownerreact
│ ➢ .status-react
│ ➢ .status-reply
│
│ 🔧 *Group* 👥
│ ➢ .admin-events
│ ➢ .goodbye
│ ➢ .welcome
│ ➢ .mention-reply
│
│ ⚙️ *System* 🛠️
│ ➢ .always-online
│ ➢ .mode
│ ➢ .setprefix
│ ➢ .setvar
│
│ 🛡️ *Filters* 🔒
│ ➢ .anti-bad
│ ➢ .antidelete
│
│ 📝 *Profile* 🧑
│ ➢ .autobio
│
╰══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '12',
  },
  audiomenu: {
    pattern: 'audiomenu',
    alias: ['admenu', '13'],
    desc: 'Show all audio effects commands',
    category: 'menu',
    react: '🎧',
    content: () => `
╭═✦〔 🎵 *Audio Menu* 〕✦═╮
│
│ 🎵 *Effects* 🎶
│ ⬩ .baby
│ ⬩ .bass
│ ⬩ .blown
│ ⬩ .chipmunk
│ ⬩ .deep
│ ⬩ .demon
│ ⬩ .earrape
│ ⬩ .fast
│ ⬩ .fat
│ ⬩ .nightcore
│ ⬩ .radio
│ ⬩ .reverse
│ ⬩ .robot
│ ⬩ .slow
│ ⬩ .smooth
│ ⬩ .tupai
│
╰══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '13',
  },
  privacymenu: {
    pattern: 'privacymenu',
    alias: ['pmenu', '14'],
    desc: 'Show all bot privacy settings',
    category: 'owner',
    react: '⚙️',
    content: () => `
╭═✧〔 🔒 *Privacy Menu* 〕✧═╮
│
│ 🔒 *Settings* 🛡️
│ ✷ .anticall
│ ✷ .blocklist
│ ✷ .getbio
│ ✷ .groupsprivacy
│ ✷ .privacy
│ ✷ .setmyname
│ ✷ .setonline
│ ✷ .setppall
│ ✷ .updatebio
│ ✷ .pmblock
│
╰═══❍

> ${config.DESCRIPTION}
    `,
    imageKey: '14',
  },
};

// Register menus dynamically
Object.values(menus).forEach((menu) => {
  malvin(
    {
      pattern: menu.pattern,
      alias: menu.alias,
      desc: menu.desc,
      category: menu.category,
      react: menu.react,
      filename: __filename,
    },
    async (malvin, mek, m, { from, sender, reply, isCreator }) => {
      try {
        // Restrict owner-only menus
        if (['ownermenu', 'settingsmenu', 'privacymenu'].includes(menu.pattern) && !isCreator) {
          return reply('❗ Only the bot owner can use this command.');
        }

        const timeInfo = getTimeInfo();
        let caption = typeof menu.content === 'function' ? menu.content(timeInfo) : menu.content;
        caption = localizeContent(caption); // Apply localization (placeholder)
        const imageUrl = config.MENU_IMAGES?.[menu.imageKey] || config.MENU_IMAGE_URL || 'https://files.catbox.moe/jw8h57.jpg';
        const imageContextInfo = getContextInfo(sender, config);
        const audioContextInfo = getAudioContextInfo(sender);

        // Handle pagination for large menus
        if (menu.paginate) {
          const pages = paginateContent(caption);
          for (let i = 0; i < pages.length; i++) {
            const pageCaption = `${pages[i]}\n\nPage ${i + 1} of ${pages.length}`;
            await sendMenuMessage(malvin, from, mek, pageCaption, imageUrl, imageContextInfo);
          }
        } else {
          await sendMenuMessage(malvin, from, mek, caption, imageUrl, imageContextInfo);
        }

        await sendAudioMessage(malvin, from, mek, menu.audioUrl, audioContextInfo);
      } catch (error) {
        handleError(error, reply, menu.desc.split(' ').slice(1).join(' '));
      }
    }
  );
});