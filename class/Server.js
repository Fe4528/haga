const ChannelClass = require("./Channel.js")

module.exports = class Server {
    constructor(obj) {
        this.channels = [];
        this.server_id = obj.server_id;
        this.server_name = obj.server_name;
    }

    addChannel(obj) {
        let channel_instance = new ChannelClass(obj);
        this.channels.push(channel_instance);

        return channel_instance;
    }

    getChannel(id) {
        const found = this.channels.find(c => c.channel_id == id);
        return found;
    }

    getServerModel() {
        return this;
    }
}