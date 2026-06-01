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

const expres = require("express")
const express = new expres()
const path = require("path")
const fs = require("fs/promises")

const WEBONLY = false;
const BaseModelObject = new BaseModelClass();

readline.emitKeypressEvents(process.stdin);

let started = false

client.on('messageCreate', async message => {
    if (!message.guild || !message.member) return;
    if (!started) return;

    //console.log(JSON.stringify(message.attachments))

    let guild = message.guild;
    let channel = message.channel;
    let current_server = BaseModelObject.getServer(guild.id);

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
    
    if (current_server) {
        let found_channel = current_server.getChannel(channel.id);
    
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
            id: guild.id,
            name: guild.name
        }).addChannel({
            channel_id: channel.id,
            channel_name: channel.name
        }).insertMessageEntry(formatted_message);
    }

    // lelemetry part //

    let server_telemetry = BaseModelObject.getServerTelemetry(guild.id);

    if (!server_telemetry) {
        server_telemetry = BaseModelObject.addServerTelemetry({ id: guild.id, name: guild.name });
    }

    server_telemetry.incrementMessageAndReturn();

    let channel_activity = server_telemetry.getChannelActivity(channel.id);

    if (!channel_activity) {
        channel_activity = server_telemetry.addChannelActivityTelemetry({ id: channel.id, name: channel.name });
    }

    channel_activity.incrementMessageCountAndReturn();

    if (message.attachments.size > 0 || message.embeds.length > 0 || message.stickers.size > 0) {
        channel_activity.incrementMediaCountAndReturn();
    }

    channel_activity.tryAddUniqueSpeaker({
        id: member.id,
        name: member.user.username
    });

    let user_activity = server_telemetry.getUserActivity(member.id);

    if (!user_activity) {
        user_activity = server_telemetry.addUserActivityTelemetry({ id: member.id, name: member.user.username });
    }

    user_activity.incrementMessage();

    updateConsoleDashboard(BaseModelObject);
})

function updateConsoleDashboard(BaseModelObject) {
    process.stdout.write('\u001B[s');
    readline.cursorTo(process.stdout, 0, 0);

    if (BaseModelObject && BaseModelObject.servers) {
        BaseModelObject.servers.forEach((server) => {
            readline.clearLine(process.stdout, 0);
            process.stdout.write(`${server.name}: ${server.message_count} (msg count)\n`);

            const targetChannels = server.channel_activities || server.channels || new Map();

            targetChannels.forEach((channel) => {
                readline.clearLine(process.stdout, 0);
                process.stdout.write(`    L ${channel.name}: ${channel.getMessageCount ? channel.getMessageCount() : 0} (msg count)\n`);

                readline.clearLine(process.stdout, 0);
                process.stdout.write(`    |     L media_count: ${channel.media_count || 0}\n`);

                const speakerCount = channel.unique_speakers ? channel.unique_speakers.size : 0;
                readline.clearLine(process.stdout, 0);
                process.stdout.write(`    |     L unique_speakers: ${speakerCount}\n`);
            });

            readline.clearLine(process.stdout, 0);
            process.stdout.write(`\n`);
        });
    }

    readline.clearLine(process.stdout, 0);
    process.stdout.write(`────────────────────────────────────────────────────\n`);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`LIVE GATEWAY LOG STREAM:\n`);

    process.stdout.write('\u001B[u');
}

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

        console.log("stopped");
        console.log(BaseModelObject);

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
