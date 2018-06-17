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
const GmailConnection_1 = require("../Connection/GmailConnection");
const GmailMessageToYoutubeMessageTransformer_1 = require("../Transformer/GmailMessageToYoutubeMessageTransformer");
const IContainerInjection_1 = require("../Container/IContainerInjection");
const Mixin_1 = require("../Utils/Mixin");
let GmailMessageRepository = class GmailMessageRepository {
    constructor(connection, transformer) {
        this.cache = new Map();
        this.connection = connection;
        this.transformer = transformer;
    }
    static create(connection, container) {
        return new this(connection, container.get(GmailMessageToYoutubeMessageTransformer_1.default));
    }
    get(id) {
        if (this.cache.has(id)) {
            return Promise.resolve(this.cache.get(id));
        }
        return this.connection.getMessageContent(id, {})
            .then((message) => {
            const yMessage = this.transformer.transform(message);
            return this.isYoutube(yMessage).then((yes) => {
                if (!yes) {
                    throw new Error(`Message with ID ${id} is not from youtube.`);
                }
                this.cache.set(id, yMessage);
                return yMessage;
            });
        });
    }
    list(after = null, max = 20) {
        const query = {
            maxResults: max,
            q: `from:${this.constructor.YOUTUBE_EMAIL}`,
        };
        if (after) {
            query.q += " before:" + after.getTimestamp();
        }
        return this.connection.getMessages(query)
            .then(({ messages }) => {
            return Promise.all(messages.map((message) => this.get(message.id)));
        });
    }
    remove(message) {
        return this.connection.removeMessage(message.getId(), {})
            .then((resp) => !!resp);
    }
    isYoutube(message) {
        return Promise.resolve(message.getSender() === this.constructor.YOUTUBE_EMAIL);
    }
};
GmailMessageRepository.YOUTUBE_EMAIL = "noreply@youtube.com";
GmailMessageRepository = __decorate([
    Mixin_1.Mixin([IContainerInjection_1.default]),
    __metadata("design:paramtypes", [GmailConnection_1.default, GmailMessageToYoutubeMessageTransformer_1.default])
], GmailMessageRepository);
exports.default = GmailMessageRepository;
//# sourceMappingURL=GmailMessageRepository.js.map