"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Err extends Error {
    static inherit(err, code) {
        const error = new Err(err.message || err, code);
        if (err.stack) {
            error.stack = err.stack;
        }
        return error;
    }
    constructor(message, code = "GENERIC") {
        super(message);
        this.code = code;
    }
}
exports.default = Err;
//# sourceMappingURL=Err.js.map