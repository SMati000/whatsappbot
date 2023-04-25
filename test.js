require('dotenv').config()

const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, RemoteAuth } = require("whatsapp-web.js");

// Require database
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");

let listening, answerPeople;

const textMenu = `text menu sample:
1. option 1
2. option 2`;

const text1 = `option 1 message sample`;

const text2 = `option 2 message sample`;

// console.log(process.env.DB)
// console.log(process.env.NRO)

// mongoose
//     .connect(
//         process.env.DB
//     )
//     .then(() => {
//         const store = new MongoStore({ mongoose: mongoose });

//         const client = new Client({
//             authStrategy: new RemoteAuth({
//                 store: store,
//                 backupSyncIntervalMs: 300000,
//             }),
//         });

        const client = new Client({
            authStrategy: new LocalAuth(),
        });

        client.initialize();

        client.on("qr", (qr) => {
            qrcode.generate(qr, { small: true });
        });

        client.on("remote_session_saved", () => {
            console.log("remote session saved");
        });

        client.on("ready", () => {
            listening = true;
            console.log("Client is ready!");
        });

        client.on("message_create", (msg) => {
            console.log("message_create");
            sendMessage(msg);
        });

        client.on("message", (msg) => {
            console.log("message");

            sendMessage(msg);

            if (answerPeople) responderMensaje(msg);
        });
    // });

async function sendMessage(msg) {
    const contact = await msg.getContact();

    if (listening && contact.isMe) {
        listening = false;
        answerPeople = msg.body === "true";
        msg.reply("Answer People: " + answerPeople)
        responderMensaje(msg);
    }

    setTimeout(() => (listening = true), 2000);
}

async function responderMensaje(msg) {
    switch (msg.body) {
        case "1":
            msg.reply(text1);
            break;
        case "2":
            msg.reply(text2);
            break;
        default:
            const contact = await msg.getContact();
            const chat = await msg.getChat();

            await chat.sendMessage(`Hola, ${contact.pushname}\n${textMenu}`);
            break;
    }
}