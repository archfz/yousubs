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
const ContainerInjectionFactory_1 = require("./ContainerInjectionFactory");
const typedi_1 = require("typedi");
const TMailClient_1 = require("../Type/TMailClient");
const GmailClient_1 = require("../Client/GmailClient");
let ClientFactory = class ClientFactory {
    constructor(injectionFactory) {
        this.injectionFactory = injectionFactory;
    }
    create(type = TMailClient_1.TMailClient.GMAIL) {
        switch (type) {
            case TMailClient_1.TMailClient.GMAIL:
                return this.injectionFactory.create(GmailClient_1.default);
            default:
                throw new Error(`Undefined client '${type}'.`);
        }
    }
};
ClientFactory = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [ContainerInjectionFactory_1.default])
], ClientFactory);
exports.default = ClientFactory;
//# sourceMappingURL=ClientFactory.js.map