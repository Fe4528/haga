const ServerObject = require("./Server.js")
const ServerTelemetry = require("./Telemetry/ServerTelemetry.js")
const UserTelemetry = require("./Telemetry/UserTelemetry.js")

module.exports = class BaseModel {
    constructor() {
        this.user_count = new Map()
        this.servers = new Map();
        this.server_telemetry = new Map()
        this.start_time = new Date().toISOString();
    }

    /**
     * (Non-telemetry) Add a ServerObject instance
     * @param {Object} obj 
     * @param {string} obj.id - ID of the server
     * @param {string} obj.name - Name of the server
     * @returns The ServerObject instance
     */
    addServer(obj) {
        let server_instance = new ServerObject(obj);
        this.servers.set(obj.id, server_instance)

        return server_instance;
    }

    /**
     * Add a ServerTelemetry instance
     * @param {Object} obj 
     * @param {string} obj.id - ID of server
     * @param {string} obj.name - Name of server
     * @returns The ServerTelemetry instance
     */
    addServerTelemetry(obj) {
        let server_telemetry = new ServerTelemetry(obj.id, obj.name);
        this.server_telemetry.set(obj.id, obj.name);

        return server_telemetry;
    }

    /**
     * Add a UserTelemetry instance (overall; non-server specific)
     * @param {Object} obj 
     * @param {string} obj.id - ID of user
     * @param {string} obj.name - Name of user (username)
     * @returns The UserTelemetry instance
     */
    addUserTelemetry(obj) {
        let user_telemetry = new UserTelemetry(obj.id, obj.name);
        this.user_count.set(obj.id, user_telemetry);

        return user_telemetry;
    }

    /**
     * Get the Server instance
     * @param {string} id - ID of server 
     * @returns The Server instance
     */
    getServer(id) {
        return this.servers.get(id);
    }

    /**
     * Get the ServerTelemetry instance
     * @param {string} id - ID of server 
     * @returns The ServerTelemetry instance
     */
    getServerTelemetry(id) {
        return this.server_telemetry.get(id);
    }

    /**
     * Get the UserTelemetry instance
     * @param {string} - ID of user
     * @returns The UserTelemetry instance
     */
    getUserCountMap(id) {
        return this.user_count.get(id);
    }
}