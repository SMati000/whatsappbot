require('dotenv').config()

const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, RemoteAuth } = require("whatsapp-web.js");

// Require database
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");

const http = require('http');
const fs = require('fs');
const ejs = require('ejs');

wqr = '';
const port = process.env.PORT || 3000;

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
    console.log('QR event');
    wqr = qr;
    server()
});

client.on("remote_session_saved", () => {
    console.log("remote session saved");
});

client.on("ready", () => {
    listening = true;
    console.log("Client is ready!");
    
    if(wqr == "")
        server();
    
    wqr = "";
});

function server() {
    const s = http.createServer((req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(`
                    <!-- index.html -->
                    <html>
                    <head>
                        <h1 id="titulo">Codigo QR:</h1>  
                    </head>  
                    <body>
                        <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
                        <div id="qrcode"></div>
                        <script type="text/javascript">
                            if("${wqr}" == "")
                                document.getElementById("titulo").textContent = "QR Code not available. You are probably already logged in.";
                            else
                                new QRCode(document.getElementById("qrcode"), "${wqr}");
                        </script>
                    </body>
                    </html>
                `);
    });
    s.listen(port, 'localhost');
}

client.on("message_create", (msg) => {
    console.log("message_create");
    sendMessage(msg);
});

client.on("message", (msg) => {
    console.log("message");

    sendMessage(msg);

    if (answerPeople) responderMensaje(msg);
});

async function sendMessage(msg) {
    const contact = await msg.getContact();
    const chat = await msg.getChat();

    if (listening && chat.name === process.env.NRO) {
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