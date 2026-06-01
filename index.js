const B_Model = require("./class/BaseModel.js");
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

const expres = require("express")
const express = new expres()
const path = require("path")
const fs = require("fs/promises")

const WEBONLY = false;
const BaseModelObject = new B_Model();

readline.emitKeypressEvents(process.stdin);

let started = false

client.on('messageCreate', async message => {
    if (!message.guild || !message.member) return;
    if (!started) return;

    //console.log(JSON.stringify(message.attachments))

    let guild = message.guild;
    let channel = message.channel;
    let base = BaseModelObject.getServer(guild.id);

    if (message.webhookId) return;
    if (message.member.user.bot) return;
    // prevent bots and webhooks

    const member = message.member;
    const user = message.author || (member ? member.user : null);

    const formatted_message = {
        guild_name: guild.name,
        channel_name: channel.name,
        timestamp: message.createdTimestamp,
        attachments: message.attachments.map(att => ({
            name: att.name,
            url: att.url,
            proxy_url: att.proxyURL
        })),
        stickers: message.stickers.map(st => ({
            name: st.name,
            url: st.url,
            tags: st.tags
        })),
        username: user ? user.globalName : "Unknown",
        nickname: member ? member.nickname : null,
        display_name: user ? user.displayName : "Unknown",
        content: message.content,
        user_id: user ? user.id : "Unknown"
    };
    
    if (base) {
        let found_channel = base.getChannel(channel.id);
    
        if (!found_channel) {
            base.addChannel({
                channel_id: channel.id,
                channel_name: channel.name
            }).insertMessageEntry(formatted_message);
        } else {
            found_channel.insertMessageEntry(formatted_message);
        }
    } else {
        BaseModelObject.addServer({
            server_id: guild.id,
            server_name: guild.name
        }).addChannel({
            channel_id: channel.id,
            channel_name: channel.name
        }).insertMessageEntry(formatted_message);
    }
})

client.on('ready', async () => {
    //client.user.setSamsungActivity('com.nexon.bluearchive', 'START');
    console.log("OK");
    console.log("Press K to save")
    started = true;
})

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', async (chunk, key) => {
    if (key && key.name == 'k'){
	started = false;
        console.log("stopped")
        console.log(BaseModelObject)

        await fs.writeFile(`./results/${Date.now()}.json`, JSON.stringify(BaseModelObject))

        process.exit();
    }
});

express.use("/pub", expres.static(path.join(__dirname, 'public')))
express.use("/results", expres.static(path.join(__dirname, 'results')))

express.get("/", (req, res) => {
    res.sendFile(__dirname + "/web.html");
})

express.listen(8080, () => {
    console.log("Webserver is on");
})

if (!WEBONLY) {
    client.login(config.token);
}
