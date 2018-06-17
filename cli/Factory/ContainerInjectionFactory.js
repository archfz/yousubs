"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const IContainerInjection_1 = require("../Container/IContainerInjection");
const Mixin_1 = require("../Utils/Mixin");
let ContainerInjectionFactory = class ContainerInjectionFactory {
    create(type, ...args) {
        if (Mixin_1.implementsMixin(type, IContainerInjection_1.default)) {
            return type.create(...args, typedi_1.Container);
        }
        return new type(...args);
    }
};
ContainerInjectionFactory = __decorate([
    typedi_1.Service()
], ContainerInjectionFactory);
exports.default = ContainerInjectionFactory;
//# sourceMappingURL=ContainerInjectionFactory.js.map