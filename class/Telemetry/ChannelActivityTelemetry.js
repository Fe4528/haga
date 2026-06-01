const BaseTelemetryObject = require("./BaseTelemetryObject");

module.exports = class ChannelActivityTelemetry extends BaseTelemetryObject {
    constructor(id, name) {
        super(id, name);
        this.message_count = 0;
    }

    addMessageCount() {
        this.message_count += 1;
    }

    getMessageCount() {
        return this.message_count;
    }
}