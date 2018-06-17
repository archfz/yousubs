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
const GmailMessageRepository_1 = require("../Repository/GmailMessageRepository");
const typedi_1 = require("typedi");
const ContainerInjectionFactory_1 = require("./ContainerInjectionFactory");
const TMessageRepository_1 = require("../Type/TMessageRepository");
let YoutubeMessageRepositoryFactory = class YoutubeMessageRepositoryFactory {
    constructor(injectionFactory) {
        this.injectionFactory = injectionFactory;
    }
    create(type = TMessageRepository_1.TMessageRepository.GMAIL, clientConnection, ...args) {
        switch (type) {
            case TMessageRepository_1.TMessageRepository.GMAIL:
                return this.injectionFactory.create(GmailMessageRepository_1.default, clientConnection);
            default:
                throw new Error(`Undefined repository '${type}'.`);
        }
    }
};
YoutubeMessageRepositoryFactory = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [ContainerInjectionFactory_1.default])
], YoutubeMessageRepositoryFactory);
exports.default = YoutubeMessageRepositoryFactory;
//# sourceMappingURL=YoutubeMessageRepositoryFactory.js.map