const BaseTelemetryObject = require("./BaseTelemetryObject.js");

module.exports = class UserTelemetry extends BaseTelemetryObject {
    constructor(id, name) {
        super(id, name)
        this.message_count = 0;
    }

    /**
     * Increment message countt
     */
    incrementMessage() {
        this.message_count++
    }
}