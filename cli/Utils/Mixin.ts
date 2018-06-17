/**
 * Helper annotation to mix multiple objects together.
 * Allow to make multiple extends.
 * @hidden
 */
export function Mixin(baseCtors: any[]) {
  return (derivedCtor: any) => {
    baseCtors.forEach((baseCtor: any) => {
      // Mixin methods.
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name: string) => {
        const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);

        if (name === "constructor") {
          return;
        }

        // Only overwrite not implemented.
        if (Object.getOwnPropertyDescriptor(derivedCtor.prototype, name)) {
          return;
        }

        if (
          descriptor && (!descriptor.writable ||
          !descriptor.configurable ||
          !descriptor.enumerable ||
          descriptor.get || descriptor.set)
        ) {
          Object.defineProperty(derivedCtor.prototype, name, descriptor);
        } else {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
        }

      });

      // Mixing static methods.
      Object.getOwnPropertyNames(baseCtor.prototype.constructor).forEach((name: string) => {
        const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype.constructor, name);

        if (["name", "length", "prototype", "constructor"].indexOf(name) !== -1) {
          return;
        }

        // Only overwrite not implemented.
        if (Object.getOwnPropertyDescriptor(derivedCtor.prototype.constructor, name)) {
          return;
        }

        if (
          descriptor && (!descriptor.writable ||
          !descriptor.configurable ||
          !descriptor.enumerable ||
          descriptor.get || descriptor.set)
        ) {
          Object.defineProperty(derivedCtor.prototype.constructor, name, descriptor);
        } else {
          derivedCtor.prototype.constructor[name] = baseCtor.prototype.constructor[name];
        }
      });

      derivedCtor.prototype._mixins = derivedCtor.prototype._mixins || [];
      derivedCtor.prototype._mixins.push(baseCtor);
    });
  };
}

/**
 * Determines if an object is an instance of a mixin class.
 *
 * @param instance
 * @param {Function} mixin
 * @returns {boolean}
 * @hidden
 */
export function instanceOfMixin(instance: any, mixin: any): boolean {
  return instance._mixins && instance._mixins.includes(mixin);
}

/**
 * Determines if an object implements a mixin class.
 *
 * @param instance
 * @param {Function} mixin
 * @returns {boolean}
 * @hidden
 */
export function implementsMixin(instance: any, mixin: any): boolean {
  return instance.prototype._mixins && instance.prototype._mixins.includes(mixin);
}
