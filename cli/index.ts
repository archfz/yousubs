#!/usr/bin/env node
import "reflect-metadata";
import {Container} from "typedi";
import Cli from "./Cli";
import {TOptions} from "./Type/TOptions";
const program = require("commander");

const CliInstance = Container.get(Cli);

const bind = (method: (...arg: any[]) => any) => method.bind(CliInstance);
const handle = (callback: (...args: any[]) => Promise<string>) => {
  return (...args: any[]) => {
    return callback(...args)
      .then((output: string) => output && console.log(output))
      .catch((err: any) => console.error(err) && process.exit(0));
  };
};

program
  .version("0.1.0")
  .option(`-m, --${TOptions.MAIL_CLIENT} [${TOptions.MAIL_CLIENT}]`, "Which mail client to use.");

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
  .option(`-f, --${TOptions.BEFORE_EMAIL} [${TOptions.BEFORE_EMAIL}]`, "The ID of the mail after which to get.")
  .action(handle(bind(CliInstance.listEmails)));

program
  .command("remove-email <id> <user> <email-id>")
  .action(handle(bind(CliInstance.removeEmail)));

program.parse(process.argv);
