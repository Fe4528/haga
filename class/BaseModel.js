const ServerObject = require("./Server.js")
const ServerTelemetry = require("./Telemetry/ServerTelemetry.js")

module.exports = class BaseModel {
    constructor(user) {
        this.servers = [];
        this.start_time = new Date().toISOString();
        this.telemetry = new ServerTelemetry()
        this.user_count = {}
    }

    addServer(obj) {
        let server_instance = new ServerObject(obj);
        this.servers.push(server_instance);

        return server_instance;
    }

    addServerTelemetry(id) {
        this.telemetry[id] = {}
    }

    getServer(id) {
        const found = this.servers.find(s => s.server_id == id);
        return found;
    }

    getServerTelemetry() {
        
    }
}