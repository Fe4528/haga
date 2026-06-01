const BaseModelClass = require("./class/BaseModel.js");
const readline = require("readline");
const config = require("./config.json");
const discord = require("discord.js-selfbot-v13");

const client = new discord.Client({
    patchVoiceStates: false, 
    checkUpdate: false,
    syncStatus: false,

    ws: {
        properties: {
            os: 'Windows',
            browser: 'Discord Client', 
            release_channel: 'stable',
            client_version: '1.0.9001',
            os_version: '10.0.19043',
            os_arch: 'x64'
        }
    },

    ext: {
        gateway: {
            lazyGuilds: true
        }
    }
});

const expres = require("express");
const express = new expres();
const path = require("path");
const fs = require("fs/promises");

const WEBONLY = false;
const BaseModelObject = new BaseModelClass();

readline.emitKeypressEvents(process.stdin);

let started = false;

client.on('messageCreate', async message => {
    if (!message.guild || !message.member) return;
    if (!started) return;
    if (message.webhookId) return;
    if (message.member.user.bot) return;

    let guild = message.guild;
    let channel = message.channel;
    const member = message.member;
    const user = message.author || (member ? member.user : null);
    const current_server = BaseModelObject.getServer(guild.id);
    const current_server_telemetry = BaseModelObject.getServerTelemetry(guild.id);

    const formatted_message = {
        guild_name: guild.name,
        channel_name: channel.name,
        timestamp: message.createdTimestamp,
        attachments: message.attachments.map(att => ({ name: att.name, url: att.url, proxy_url: att.proxyURL })),
        stickers: message.stickers.map(st => ({ name: st.name, url: st.url, tags: st.tags })),
        username: user ? user.globalName : "Unknown",
        nickname: member ? member.nickname : null,
        display_name: user ? user.displayName : "Unknown",
        content: message.content,
        user_id: user ? user.id : "Unknown"
    };

    // check first if current server exists in memory
    if (current_server) {
        // if current server exist
        let current_channel = current_server.getChannel(channel.id);
        if (!current_channel) {
            // no current channel logged in current server
            current_server.addChannel({
                channel_id: channel.id,
                channel_name: channel.name
            }).insertMessageEntry(formatted_message);
        } else {
            // channel exists
            current_channel.insertMessageEntry(formatted_message)
        }
    } else {
        // current server does not exist in memory, so we create
        BaseModelObject.addServer({
            id: guild.id,
            name: guild.name
        }).addChannel({
            channel_id: channel.id,
            channel_name: channel.name
        }).insertMessageEntry(formatted_message)
    }

    // telemetry part
    // same logic above i guess

    if (current_server_telemetry) {
        // has telemetry instance already
        current_server_telemetry.incrementMessageCount()
    } else {
        // no telemetry instance found
        BaseModelObject.addServerTelemetry({
            id: guild.id,
            name: guild.name
        }).incrementMessageCount()
    }

    BaseModelObject.incrementTotalMesagesCount();
    updateConsoleDashboard(BaseModelObject)
});

function updateConsoleDashboard(BaseModelObject) {
    let telemetry_data = BaseModelObject.server_telemetry;
    console.clear()

    telemetry_data.forEach((server, val) => {
        console.log(`${server.getMessageCount()} messages\t->\t${server.name}`);
    });

    console.log(`\n\n${BaseModelObject.getTotalMessagesCount()} messages\t->\tTotal Messages`);
}
client.on('ready', async () => {
    console.log("OK");
    console.log("Press K to save");
    console.clear();
    started = true;
});

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', async (chunk, key) => {
    if (key && key.name == 'k'){
        started = false;

        console.log("stopped");
        //console.log(BaseModelObject);

        const mapToArrayReplacer = (key, value) => {
            if (value instanceof Map) {
                return Array.from(value.values());
            }
            return value;
        };

        const data_to_save = JSON.stringify(BaseModelObject, mapToArrayReplacer, 4);

        await fs.writeFile(`./results/${Date.now()}.json`, data_to_save);

        process.exit();
    }
});

express.use("/pub", expres.static(path.join(__dirname, 'public')));
express.use("/results", expres.static(path.join(__dirname, 'results')));

express.get("/", (req, res) => {
    res.sendFile(__dirname + "/web.html");
});

express.listen(8080, () => {
    console.log("Webserver is on");
});

if (!WEBONLY) {
    client.login(config.token);
}