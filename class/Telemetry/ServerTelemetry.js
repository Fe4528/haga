const BaseTelemetryObject = require("./BaseTelemetryObject.js");
const ChannelActivityTelemetry = require("./ChannelActivityTelemetry.js");
const UserTelemetry = require("./UserTelemetry.js");

module.exports = class ServerTelemetry extends BaseTelemetryObject {
    constructor(id, name) {
        super(id, name);
        this.channel_activities = new Map();
        this.user_activities = new Map();
        this.message_count = 0;
    }

    /**
     * Add a ChannelTelemetry instance in this server
     * @param {Object} obj 
     * @param {string} obj.id - ID of channel
     * @param {string} obj.name - Name of channel
     * @returns The ChannelActivitytelemetry instance
     */
    addChannelActivityTelemetry(obj) {
        let channel_activity = new ChannelActivityTelemetry(obj.id, obj.name);
        this.channel_activities.set(obj.id, channel_activity);

        return channel_activity;
    }

    /**
     * Add a UserTelemetry instance in this server
     * @param {Object} obj 
     * @param {string} obj.id - ID of user
     * @param {string} obj.name - Name of user
     * @returns The UserTelemetry instance
     */
    addUserActivityTelemetry(obj) {
        let user_activity = new UserTelemetry(obj.id, obj.name);
        this.user_activities.set(obj.id, user_activity);

        return user_activity;
    }

    /**
     * Get the ChannelActivityTelemetry instance in this server
     * @param {string} id - ID of channel 
     * @returns The ChannelActivityTelemetry instance in this server
     */
    getChannelActivity(id) {
        return this.channel_activities.get(id);
    }

    /**
     * Get the UserActivity instance in this server
     * @param {string} id - ID of user 
     * @returns The UserTelemetry instance in this server
     */
    getUserActivity(id) {
        return this.user_activities.get(id);
    }

    /**
     * Increment the count of messages sent in this server, then return the updated count
     * @returns The updated count of messages in this server
     */
    incrementMessageAndReturn() {
        return ++this.message_count;
    }
}