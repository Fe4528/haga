const BaseModelClass = require("./class/BaseModel.js");
const readline = require("readline");
const config = require("./config.json");
const discord = require("discord.js-selfbot-v13");
const JSONStream = require("JSONStream")
const fs = require("fs");

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

/*
const expres = require("express");
const express = new expres();
*/

const path = require("path");
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
        username: user ? user.username : "Unknown",
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
                id: channel.id,
                name: channel.name
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
            id: channel.id,
            name: channel.name
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
        console.log(`${server.getMessageCount()} message(s)\t->\t${server.name}`);
    });

    console.log(`\n\n${BaseModelObject.getTotalMessagesCount()}\t->\tTotal Messages\n${BaseModelObject.messages_per_sec}\t->\tmsg(s)/sec`);
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
    if (key && key.name == 'k') {
        if (!started) return;

        started = false;
        console.clear();
        console.log("Saving results...\n");

        const session_id = Date.now().toString();
        const session_folder = path.join(__dirname, "results", session_id);

        if (!fs.existsSync(session_folder)) {
            fs.mkdirSync(session_folder, { recursive: true });
        }

        const servers_array = Array.from(BaseModelObject.servers.values());
        const total_servers = servers_array.length;

        for (let s_idx = 0; s_idx < total_servers; s_idx++) {
            const server = servers_array[s_idx];
            
            fs.mkdirSync(path.join(__dirname, "results", session_id, server.id), { recursive: true });
            
            fs.appendFileSync(
                path.join(__dirname, "results", session_id, "servers.jsonl"), 
                JSON.stringify({
                    guild_name: server.name,
                    guild_id: server.id,
                    path: `./results/${session_id}/${server.id}/`
                }) + "\n", 
                "utf-8"
            );

            const channels_array = server.channels ? Array.from(server.channels.values()) : [];
            const total_channels = channels_array.length;

            for (let c_idx = 0; c_idx < total_channels; c_idx++) {
                const channel = channels_array[c_idx];
                const history_file_dir = path.join(__dirname, "results", session_id, server.id, channel.id, "history.jsonl");

                fs.mkdirSync(path.join(__dirname, "results", session_id, server.id, channel.id), { recursive: true });
                
                fs.appendFileSync(
                    path.join(__dirname, "results", session_id, server.id, "channels.jsonl"),
                    JSON.stringify({
                        channel_name: channel.name,
                        channel_id: channel.id,
                        path: `./results/${session_id}/${server.id}/${channel.id}`
                    }) + "\n", 
                    'utf8'
                );

                const chat_history = channel.chat_history || [];
                const total_messages = chat_history.length;

                for (let m_idx = 0; m_idx < total_messages; m_idx++) {
                    const history_entry = chat_history[m_idx];
                    
                    fs.appendFileSync(history_file_dir, JSON.stringify(history_entry) + "\n", 'utf-8');
                    readline.cursorTo(process.stdout, 0, 2); 

                    readline.clearLine(process.stdout, 1);
                    process.stdout.write(`current server: ${s_idx + 1}/${total_servers} (${server.name})\n`);
                    
                    readline.clearLine(process.stdout, 1);
                    process.stdout.write(`current channel: ${c_idx + 1}/${total_channels} (${channel.name || 'Unknown Channel'})\n`);
                    
                    readline.clearLine(process.stdout, 1);
                    process.stdout.write(`processing message: ${m_idx + 1}/${total_messages}\n`);
                }
            }
        }

        console.log("\n\nFinished");
        process.exit(0);
    }
});

/*
express.use("/pub", expres.static(path.join(__dirname, 'public')));
express.use("/results", expres.static(path.join(__dirname, 'results')));

express.get("/", (req, res) => {
    res.sendFile(__dirname + "/web.html");
});

express.listen(8080, () => {
    console.log("Webserver is on");
});

web UI doesnt work anymore with the new format so don't uncomment this
but i'll leave web.html here just for fun
*/

client.login(config.token);
