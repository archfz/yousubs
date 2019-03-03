#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const Cli_1 = require("./Cli");
const TOptions_1 = require("./Type/TOptions");
const program = require("commander");
const CliInstance = typedi_1.Container.get(Cli_1.default);
const bind = (method) => method.bind(CliInstance);
const handle = (callback) => {
    return (...args) => {
        return callback(...args)
            .then((output) => output && console.log(output))
            .catch((err) => { console.error(err); process.exit(1); });
    };
};
program
    .version("0.1.0")
    .option(`-m, --${TOptions_1.TOptions.MAIL_CLIENT} [${TOptions_1.TOptions.MAIL_CLIENT}]`, "Which mail client to use.");
program
    .command("list-auth")
    .description("Lists authentication IDs.")
    .action(handle(bind(CliInstance.listAuths)));
program
    .command("has-auth <id>")
    .description("Check if authentication exists for ID.")
    .action(handle(bind(CliInstance.hasAuth)));
program
    .command("check-auth <id> <password>")
    .description("Check if authentication is correct.")
    .action(handle(bind(CliInstance.checkAuth)));
program
    .command("add-auth <id> <password> <credentials>")
    .description("Adds authorization for new user.")
    .action(handle(bind(CliInstance.createAuth)));
program
    .command("list-emails <id> <user>")
    .option(`-f, --${TOptions_1.TOptions.BEFORE_EMAIL} [${TOptions_1.TOptions.BEFORE_EMAIL}]`, "The ID of the mail after which to get.")
    .action(handle(bind(CliInstance.listEmails)));
program
    .command("remove-email <id> <user> <email-id>")
    .action(handle(bind(CliInstance.removeEmail)));
program.parse(process.argv);
//# sourceMappingURL=index.js.map