const BaseTelemetryObject = require("./BaseTelemetryObject.js");
const UserTelemetry = require("./UserTelemetry.js")

module.exports = class ChannelActivityTelemetry extends BaseTelemetryObject {
    constructor(id, name) {
        super(id, name);
        this.message_count = 0;
        this.media_count = 0;
        this.unique_speakers = new Map()
    }

    /**
     * Increments the total messages sent in this channel, and then return it
     * @returns The updated message count
     */
    incrementMessageCountAndReturn() {
        return ++this.message_count;
    }

    /**
     * Increments the total medias sent in this channel, and then return it
     * @returns The updated sent media count
     */
    incrementMediaCountAndReturn() {
        return ++this.media_count;
    }

    /**
     * Tries to add a UserTelemetry object in this map. If the user already exists here, do not continue
     * @param {Object} obj
     * @param {string} obj.id - ID of the user
     * @param {string} obj.name - Name of the user 
     */
    tryAddUniqueSpeaker(obj) {
        if (!this.unique_speakers.has(obj.id)) {
            this.unique_speakers.set(obj.id, {
                id: obj.id,
                name: obj.name
            })
        }
    }

    /**
     * Get the message count in this channel
     * @returns The message count in this channel
     */
    getMessageCount() {
        return this.message_count;
    }
}