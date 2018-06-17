import IConnection from "./IConnection";
import {google} from "googleapis";

export default class GmailConnection implements IConnection {

  private clientConnection: any;

  constructor(auth: any) {
    this.clientConnection = google.gmail({version: "v1", auth});
  }

  public getMessages(query: any = {}): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.clientConnection.users.messages.list({
        userId: "me",
        ...query,
      }, (err: any, resp: any) => {
        if (err) {
          reject(err);
        }

        resolve(resp.data);
      });
    });
  }

  public removeMessage(id: string, query: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.clientConnection.users.messages.delete({
        userId: "me",
        id,
        ...query,
      }, (err: any, resp: any) => {
        if (err) {
          reject(err);
        }

        resolve(resp.data);
      });
    });
  }

  public getMessageContent(id: string, query: any): any {
    return new Promise<any>((resolve, reject) => {
      this.clientConnection.users.messages.get({
        userId: "me",
        id,
        ...query,
      }, (err: any, resp: any) => {
        if (err) {
          reject(err);
        }

        resolve(resp.data);
      });
    });
  }

}
