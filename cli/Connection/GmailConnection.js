"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
class GmailConnection {
    constructor(auth) {
        this.clientConnection = googleapis_1.google.gmail({ version: "v1", auth });
    }
    getMessages(query = {}) {
        return new Promise((resolve, reject) => {
            this.clientConnection.users.messages.list(Object.assign({ userId: "me" }, query), (err, resp) => {
                if (err) {
                    reject(err);
                }
                resolve(resp.data);
            });
        });
    }
    removeMessage(id, query) {
        return new Promise((resolve, reject) => {
            this.clientConnection.users.messages.delete(Object.assign({ userId: "me", id }, query), (err, resp) => {
                if (err) {
                    reject(err);
                }
                resolve(resp.data);
            });
        });
    }
    getMessageContent(id, query) {
        return new Promise((resolve, reject) => {
            this.clientConnection.users.messages.get(Object.assign({ userId: "me", id }, query), (err, resp) => {
                if (err) {
                    reject(err);
                }
                resolve(resp.data);
            });
        });
    }
}
exports.default = GmailConnection;
//# sourceMappingURL=GmailConnection.js.map