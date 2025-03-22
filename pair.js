const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    async function PrabathPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let PrabathPairWeb = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!PrabathPairWeb.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await PrabathPairWeb.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            PrabathPairWeb.ev.on('creds.update', saveCreds);
            PrabathPairWeb.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    try {
                        await delay(10000);
                        const sessionPrabath = fs.readFileSync('./session/creds.json');

                        const auth_path = './session/';
                        const user_jid = jidNormalizedUser(PrabathPairWeb.user.id);

                      function randomMegaId(length = 6, numberLength = 4) {
                      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                      let result = '';
                      for (let i = 0; i < length; i++) {
                      result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                       const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                        }
let sessionXeon = fs.readFileSync(auth_path + 'creds.json', 'utf-8'); 
                     await PrabathPairWeb.sendMessage(PrabathPairWeb.user.id, { text: `*SESSION ID GENERATED SUCCESSFULY* ✅\n` });
        
           await delay(1000 * 2);
           const xeonses = await PrabathPairWeb.sendMessage(PrabathPairWeb.user.id, { text: sessionXeon });
             await PrabathPairWeb.sendMessage(PrabathPairWeb.user.id, { text: `┏━━━━━━━━━━━━━━ 
┃𝐒𝐇𝐄𝐈𝐊𝐇-𝐀𝐋𝐈-𝐌𝐃
┃𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐒
┃𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 
┃𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅🔥
┗━━━━━━━━━━━━━━━ 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ᴄʀᴇᴀᴛᴏʀ = 𖥘⚡ 𝐀𝐋𝐈 𝐀𝐇𝐌𝐀𝐃•••²⁴⁰² ⚡𖥘 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ᴏᴡɴᴇʀ = https://wa.me/923143702270 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ᴡʜᴀᴛsᴀᴘᴘ = https://whatsapp.com/channel/0029Vao1lnR1nozDF8jBNh3B
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ʙᴏᴛ ʀᴇᴘᴏ = https://github.com/SHEIKH-ALI-2402/SHEIKH-ALI-MD 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ʏᴏᴜᴛᴜʙᴇ = https://youtube.com/@sheikh-ali-2412?si=jtHyERObmqci0YEo  
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓄂𝕚𝕥𝕩.𝑺𝑯𝑬𝑰𝑲𝑯 𝑨𝑳𝑰 🔥༽༼ ♡ ` }, {quoted: xeonses});   
                    } catch (e) {
                        exec('pm2 restart prabath');
                    }

                    await delay(100);
                    return await removeFile('./session');
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    PrabathPair();
                }
            });
        } catch (err) {
            exec('pm2 restart prabath-md');
            console.log("service restarted");
            PrabathPair();
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await PrabathPair();
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    exec('pm2 restart prabath');
});


module.exports = router;
