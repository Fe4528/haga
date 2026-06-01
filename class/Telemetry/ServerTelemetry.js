const BaseTelemetryObject = require("./BaseTelemetryObject.js");
const ChannelActivityTelemetry = require("./ChannelActivityTelemetry.js")

module.exports = class ServerTelemetry extends BaseTelemetryObject {
    constructor(id, name) {
        super(id, name);
        this.channel_activity = new ChannelActivityTelemetry();
    }

    getChannelActivity() {
        return this.channel_activity;
    }
}