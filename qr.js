const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const QRCode = require('qrcode');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    async function startQRSession() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let bot = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            bot.ev.on('creds.update', saveCreds);

            bot.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    const qrImage = await QRCode.toDataURL(qr);
                    res.send(`
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>NOTHING BEN QR SCANNER</title>
                                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        font-family: 'Outfit', sans-serif;
                                        background: linear-gradient(-45deg, #4a90e2, #3ac569, #9b59b6, #e74c3c);
                                        background-size: 400% 400%;
                                        animation: gradient 10s ease infinite;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        height: 100vh;
                                    }

                                    @keyframes gradient {
                                        0% { background-position: 0% 50%; }
                                        50% { background-position: 100% 50%; }
                                        100% { background-position: 0% 50%; }
                                    }

                                    #content {
                                        display: flex;
                                        flex-direction: column;
                                        width: 22rem;
                                        text-align: center;
                                        background-color: #000000;
                                        padding: 1rem;
                                        border-radius: 14px;
                                    }

                                    #QR-content img {
                                        border-radius: 10px;
                                        width: 20rem;
                                    }

                                    .reload-button {
                                        display: inline-block;
                                        padding: 10px 20px;
                                        background-color: #3498db;
                                        color: #fff;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        transition: background-color 0.3s ease;
                                        margin-top: 20px;
                                    }

                                    .reload-button:hover {
                                        background-color: #2980b9;
                                    }

                                    progress {
                                        width: 100%;
                                        height: 20px;
                                        margin-top: 10px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div id="content">
                                    <div id="QR-content">
                                        <img src="${qrImage}" alt="QR Code"/>
                                    </div>
                                    <div id="title-container">
                                        <h2>DRAXEN QR</h2>
                                        <p>Scan This QR Code</p>
                                    </div>
                                    <progress value="0" max="60" id="progressBar"></progress>
                                    <a href="javascript:location.reload()" class="reload-button">Reload Page</a>
                                </div>
                                <script>
                                    var timeleft = 60;
                                    var downloadTimer = setInterval(function () {
                                        if (timeleft <= 0) {
                                            clearInterval(downloadTimer);
                                            location.reload(); // ریلود خودکار صفحه بعد از 60 ثانیه
                                        } else {
                                            document.getElementById("progressBar").value = 60 - timeleft;
                                            timeleft -= 1;
                                        }
                                    }, 1000);
                                </script>
                            </body>
                        </html>
                    `);
                }

                if (connection === "open") {
                    try {
                        await delay(5000);
                        const sessionData = fs.readFileSync('./session/creds.json', 'utf-8');
                        const userJid = jidNormalizedUser(bot.user.id);

                        // ارسال پیام اولیه
                        await bot.sendMessage(userJid, { text: `*SESSION ID GENERATED SUCCESSFULLY* ✅\n` });
                        await delay(2000);
                        const sessionMessage = await bot.sendMessage(userJid, { text: sessionData });
                        await bot.sendMessage(userJid, { 
                            text: `┏━━━━━━━━━━━━━━ 
┃DRAXEN-Ai
┃𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐒
┃𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 
┃𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✅🔥
┗━━━━━━━━━━━━━━━ 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ᴄʀᴇᴀᴛᴏʀ = 𖥘⚡ DRAXEN•••²⁴⁰² ⚡𖥘 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ᴏᴡɴᴇʀ = https://wa.me/255716945971
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ᴡʜᴀᴛsᴀᴘᴘ = https://files.catbox.moe/c5wfno.mp3
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ʙᴏᴛ ʀᴇᴘᴏ = https://github.com/abdallahsalimjuma/DRAXEN-Ai
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ★ || ʏᴏᴜᴛᴜʙᴇ = https://youtube.com/@abdallahsalim-f5u?si=PPyQy2qogiXA-PCG 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ DRAXEN-Ai `, 
                            quoted: sessionMessage 
                        });

                        console.log(`✅ WhatsApp Connected: ${userJid}`);
                    } catch (e) {
                        exec('pm2 restart bot');
                    }

                    await delay(100);
                    removeFile('./session');
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10000);
                    startQRSession();
                }
            });
        } catch (err) {
            exec('pm2 restart bot');
            console.log("Service restarted due to error.");
            startQRSession();
        }
    }
    return await startQRSession();
});

process.on('uncaughtException', function (err) {
    console.log('⚠ Caught exception:', err);
    exec('pm2 restart bot');
});

module.exports = router;
