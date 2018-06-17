"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Mixin(baseCtors) {
    return (derivedCtor) => {
        baseCtors.forEach((baseCtor) => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
                const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
                if (name === "constructor") {
                    return;
                }
                if (Object.getOwnPropertyDescriptor(derivedCtor.prototype, name)) {
                    return;
                }
                if (descriptor && (!descriptor.writable ||
                    !descriptor.configurable ||
                    !descriptor.enumerable ||
                    descriptor.get || descriptor.set)) {
                    Object.defineProperty(derivedCtor.prototype, name, descriptor);
                }
                else {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                }
            });
            Object.getOwnPropertyNames(baseCtor.prototype.constructor).forEach((name) => {
                const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype.constructor, name);
                if (["name", "length", "prototype", "constructor"].indexOf(name) !== -1) {
                    return;
                }
                if (Object.getOwnPropertyDescriptor(derivedCtor.prototype.constructor, name)) {
                    return;
                }
                if (descriptor && (!descriptor.writable ||
                    !descriptor.configurable ||
                    !descriptor.enumerable ||
                    descriptor.get || descriptor.set)) {
                    Object.defineProperty(derivedCtor.prototype.constructor, name, descriptor);
                }
                else {
                    derivedCtor.prototype.constructor[name] = baseCtor.prototype.constructor[name];
                }
            });
            derivedCtor.prototype._mixins = derivedCtor.prototype._mixins || [];
            derivedCtor.prototype._mixins.push(baseCtor);
        });
    };
}
exports.Mixin = Mixin;
function instanceOfMixin(instance, mixin) {
    return instance._mixins && instance._mixins.includes(mixin);
}
exports.instanceOfMixin = instanceOfMixin;
function implementsMixin(instance, mixin) {
    return instance.prototype._mixins && instance.prototype._mixins.includes(mixin);
}
exports.implementsMixin = implementsMixin;
//# sourceMappingURL=Mixin.js.map