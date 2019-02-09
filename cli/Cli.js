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
const typedi_1 = require("typedi");
const ClientFactory_1 = require("./Factory/ClientFactory");
const YoutubeMessageRepositoryFactory_1 = require("./Factory/YoutubeMessageRepositoryFactory");
const TOptions_1 = require("./Type/TOptions");
const YoutubeMessage_1 = require("./Model/YoutubeMessage");
let Cli = class Cli {
    listAuths(options) {
        return this.clientFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT])
            .getAuthentications()
            .then((auths) => auths.join("\n"));
    }
    hasAuth(id, options) {
        return this.clientFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT])
            .hasAuthentication(id)
            .then((has) => has ? "true" : "false");
    }
    checkAuth(id, password, options) {
        return this.clientFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT])
            .connect(id, password)
            .then(() => "ok")
            .catch((err) => {
            if (err.code === "AUTH_FAIL") {
                return "fail";
            }
            throw err;
        });
    }
    createAuth(id, password, credentials, options) {
        credentials = credentials.charAt(0) === "'" ? credentials.slice(1, -1) : credentials;
        return this.clientFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT])
            .createAuthentication(id, password, JSON.parse(credentials))
            .then((created) => {
            if (!created) {
                throw new Error(`Failed to create authentication.`);
            }
            return "created";
        });
    }
    listEmails(id, password, options) {
        return this.clientFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT])
            .connect(id, password)
            .then((auth) => {
            return this.messageRepoFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT], auth)
                .list(options[TOptions_1.TOptions.BEFORE_EMAIL]);
        })
            .then((messages) => {
            messages = messages.filter((m) => m.getVideoId());
            return JSON.stringify(messages);
        });
    }
    removeEmail(id, password, emailIds, options) {
        return this.clientFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT])
            .connect(id, password)
            .then((auth) => this.messageRepoFactory.create(options[TOptions_1.TOptions.MAIL_CLIENT], auth))
            .then((repo) => {
            const promises = emailIds.split(",").map((emailId) => {
                return repo.remove(new YoutubeMessage_1.default().setId(emailId));
            });
            return Promise.all(promises);
        })
            .then((responses) => {
            const removeCount = responses.filter((res) => res == true).length;
            return "removed " + removeCount;
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", ClientFactory_1.default)
], Cli.prototype, "clientFactory", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", YoutubeMessageRepositoryFactory_1.default)
], Cli.prototype, "messageRepoFactory", void 0);
Cli = __decorate([
    typedi_1.Service()
], Cli);
exports.default = Cli;
//# sourceMappingURL=Cli.js.map