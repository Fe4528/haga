module.exports = class Channel {
    constructor(obj) {
        this.channel_name = obj.channel_name;
        this.channel_id = obj.channel_id;
        this.chat_history = [];
    }

    insertMessageEntry(obj) {
        this.chat_history.push(obj);
        console.log(`(${obj.guild_name}) [${obj.user_id}] ${obj.username}: ${obj.content}`)
        // pass the default Message object
    }
}