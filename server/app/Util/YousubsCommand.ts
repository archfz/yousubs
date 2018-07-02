import * as nProcess from "child_process";

let CLI: string = "yousubs-cli";

if (process.env.YS_DEV) {
  CLI = "node ./cli/index.js";
}

export default class YousubsCommand {

  public static execute(...args: any[]): Promise<string> {
    const command = args.map((arg: any) => {
      if (typeof arg === "object") {
        return '"' + JSON.stringify(arg).replace(/"/g, "\\\"") + '"';
      }

      arg = arg.toString();
      return arg.indexOf(" ") === -1 || arg.indexOf("\"")  ?
        arg : '"' + arg.replace(/"/g, "\\\"") + '"';
    }).join(" ");

    return new Promise<string>((resolve: any, reject: any) => {
      nProcess.exec(CLI + " " + command, (err: any, stdout: any, stderr: any) => {
        if (err) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
  }

}
