"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const crypto = require("crypto");
let Crypto = class Crypto {
    decryptWPW(text, password) {
        const parts = text.split(":");
        const iv = Buffer.from(parts.pop(), "hex");
        const key = crypto
            .createHash("sha256")
            .update(password)
            .digest().slice(0, 32);
        text = parts.join(":");
        const decipher = crypto.createDecipheriv(this.constructor.ALGO, key, iv);
        const dec = decipher.update(text, "hex");
        return Buffer.concat([dec, decipher.final()]).toString();
    }
    encryptWPW(text, password) {
        const iv = crypto.pseudoRandomBytes(16);
        const key = crypto
            .createHash("sha256")
            .update(password)
            .digest().slice(0, 32);
        const cipher = crypto.createCipheriv(this.constructor.ALGO, key, iv);
        const dec = cipher.update(text, "utf8", "hex");
        return dec + cipher.final("hex") + ":" +
            iv.toString("hex");
    }
};
Crypto.ALGO = "aes-256-cbc";
Crypto = __decorate([
    typedi_1.Service()
], Crypto);
exports.default = Crypto;
//# sourceMappingURL=Crypto.js.map