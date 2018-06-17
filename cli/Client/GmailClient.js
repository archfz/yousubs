"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const TMailClient_1 = require("../Type/TMailClient");
const Crypto_1 = require("../Utils/Crypto");
const ConnectionFactory_1 = require("../Factory/ConnectionFactory");
const IContainerInjection_1 = require("../Container/IContainerInjection");
const ConfigStore_1 = require("../Config/ConfigStore");
const TConnection_1 = require("../Type/TConnection");
const googleapis_1 = require("googleapis");
const Mixin_1 = require("../Utils/Mixin");
const Err_1 = require("../Error/Err");
let GmailClient = class GmailClient {
    constructor(config, cipher, connectionFactory) {
        this.config = config;
        this.cipher = cipher;
        this.connectionFactory = connectionFactory;
    }
    static create(container) {
        return new this(container.get(ConfigStore_1.default), container.get(Crypto_1.default), container.get(ConnectionFactory_1.default));
    }
    getAuthentications() {
        return Promise.resolve((this.getConfig("users") || []).map((user) => user.id));
    }
    hasAuthentication(id) {
        return Promise.resolve(!!(this.getConfig("users") || [])
            .find((user) => user.id === id));
    }
    createAuthentication(id, password, credentials) {
        if (!credentials.token) {
            throw new Error(`Missing credential token for gmail client. Cannot create user.`);
        }
        return this.hasAuthentication(id).then((yes) => {
            if (yes) {
                throw new Error(`User with ID '${id}' already exists.`);
            }
        })
            .then(() => {
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            return new Promise((resolve, reject) => {
                oAuth2Client.getToken(credentials.token, (err, token) => {
                    if (err) {
                        return reject(err);
                    }
                    credentials.token = token;
                    resolve();
                });
            });
        })
            .then(() => {
            const users = this.getConfig("users") || [];
            users.push({
                id,
                credentials: this.cipher.encryptWPW(JSON.stringify(credentials), password),
            });
            this.setConfig("users", users);
            return true;
        });
    }
    connect(id, password) {
        const userData = (this.getConfig("users") || [])
            .find((user) => user.id === id);
        if (!userData) {
            throw new Err_1.default(`User with id ${id} not found.`, "USER_NOT_FOUND");
        }
        let credentials;
        try {
            credentials = JSON.parse(this.cipher.decryptWPW(userData.credentials, password));
        }
        catch (err) {
            throw Err_1.default.inherit(err, "AUTH_FAIL");
        }
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        if (!credentials.token) {
            throw new Error("Missing token on credentials");
        }
        oAuth2Client.setCredentials(credentials.token);
        return Promise.resolve(this.connectionFactory.create(TConnection_1.TConnection.GMAIL, oAuth2Client));
    }
    getConfig(key = "") {
        return this.config.get("mail_clients." + TMailClient_1.TMailClient.GMAIL + (key ? "." + key : ""));
    }
    setConfig(key, value) {
        return this.config.set("mail_clients." + TMailClient_1.TMailClient.GMAIL + (key ? "." + key : ""), value);
    }
};
GmailClient = __decorate([
    Mixin_1.Mixin([IContainerInjection_1.default]),
    __metadata("design:paramtypes", [Object, Crypto_1.default, ConnectionFactory_1.default])
], GmailClient);
exports.default = GmailClient;
//# sourceMappingURL=GmailClient.js.map