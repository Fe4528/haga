const Channel = require("./Channel.js");

module.exports = class Server {
    constructor(obj) {
        this.channels = new Map();
        this.id = obj.id;
        this.name = obj.name;
    }

    /**
     * Add a channel
     * @param {Object} obj
     * @param {string} obj.id - ID of channel
     * @param {string} obj.name - Name of channel
     * @returns {Channel}
     */
    addChannel(obj) {
        let channel_instance = new Channel(obj);
        this.channels.set(obj.id, channel_instance);

        return channel_instance;
    }

    /**
     * Get current channel
     * @param {string} id 
     * @returns {Channel}
     */
    getChannel(id) {
        return this.channels.get(id);
    }

    getServerModel() {
        return this;
    }

    toJSON() {
        return {
            server_id: this.server_id,
            server_name: this.server_name,

            channels: Array.from(this.channels.values()) 
        };
    }
}