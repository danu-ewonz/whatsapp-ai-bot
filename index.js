const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const axios = require("axios");
const config = require("./config");

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    let aiEnabled = true;

    sock.ev.on("messages.upsert", async ({ messages }) => {

        const msg = messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        const isOwner = sender.includes(config.owner);

        console.log(text);

        // 🔘 AI ON/OFF (FREE)
        if (text === "ai off" && isOwner) {
            aiEnabled = false;
            return sock.sendMessage(sender, { text: "🤖 AI OFF ❌" });
        }

        if (text === "ai on" && isOwner) {
            aiEnabled = true;
            return sock.sendMessage(sender, { text: "🤖 AI ON ✅" });
        }

        // 💬 BASIC AUTO REPLY (FREE)
        if (text === "hi") {
            return sock.sendMessage(sender, { text: "👋 Hello bro!" });
        }

        if (text === "menu") {
            return sock.sendMessage(sender, {
                text: "📌 Commands:\nhi\nai <question>\nai on\nai off"
            });
        }

        // 🧠 FREE AI SYSTEM (NO COST API)
        if (aiEnabled && text.startsWith("ai ")) {

            const q = text.replace("ai ", "");

            try {
                const res = await axios.get(
                    `https://api.affiliateplus.xyz/api/chatbot?message=${q}&botname=AngelBot`
                );

                return sock.sendMessage(sender, {
                    text: res.data.message
                });

            } catch (e) {
                return sock.sendMessage(sender, {
                    text: "🤖 AI not working now"
                });
            }
        }

    });
}

startBot();
