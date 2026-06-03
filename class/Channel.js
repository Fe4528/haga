module.exports = class Channel {
    constructor(obj) {
        this.name = obj.name;
        this.id = obj.id;
        this.chat_history = [];
    }

    insertMessageEntry(obj) {
        this.chat_history.push(obj);
        //console.log(`(${obj.guild_name}) [${obj.user_id}] ${obj.username}: ${obj.content}`)
        // pass the default Message object
    }
}