import IClient from "./IClient";
import IConfigStore from "../Config/IConfigStore";
import {TMailClient} from "../Type/TMailClient";
import Crypto from "../Utils/Crypto";
import ConnectionFactory from "../Factory/ConnectionFactory";
import IContainerInjection from "../Container/IContainerInjection";
import {Container} from "typedi";
import ConfigStore from "../Config/ConfigStore";
import {TConnection} from "../Type/TConnection";
import {google} from "googleapis";
import IConnection from "../Connection/IConnection";
import {Mixin} from "../Utils/Mixin";
import Err from "../Error/Err";

@Mixin([IContainerInjection])
export default class GmailClient implements IClient, IContainerInjection {

  public static create(container: typeof Container): GmailClient {
    return new this(
      container.get(ConfigStore),
      container.get(Crypto),
      container.get(ConnectionFactory)
    );
  }

  protected config: IConfigStore;
  protected cipher: Crypto;
  protected connectionFactory: ConnectionFactory;

  constructor(config: IConfigStore, cipher: Crypto, connectionFactory: ConnectionFactory) {
    this.config = config;
    this.cipher = cipher;
    this.connectionFactory = connectionFactory;
  }

  public getAuthentications(): Promise<string[]> {
    return Promise.resolve(
      (this.getConfig("users") || []).map((user: any) => user.id));
  }

  public hasAuthentication(id: string): Promise<boolean> {
    return Promise.resolve(
      !!(this.getConfig("users") || [])
        .find((user: any) => user.id === id));
  }

  public createAuthentication(id: string, password: string, credentials: any): Promise<boolean> {
    if (!credentials.token) {
      throw new Error(`Missing credential token for gmail client. Cannot create user.`);
    }

    return this.hasAuthentication(id).then((yes) => {
        if (yes)  {
          throw new Error(`User with ID '${id}' already exists.`);
        }
      })
      .then(() => {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

        return new Promise((resolve, reject) => {
          oAuth2Client.getToken(credentials.token, (err, token) => {
            if (err) {
              return reject(err);
            }

            credentials.token = token;
            resolve();
          });
        });
      })
      .then(() => {

        const users = this.getConfig("users") || [];
        users.push({
          id,
          credentials: this.cipher.encryptWPW(JSON.stringify(credentials), password),
        });

        this.setConfig("users", users);
        return true;
      });
  }

  public connect(id: string, password: string): Promise<IConnection> {
    const userData = (this.getConfig("users") || [])
      .find((user: any) => user.id === id);

    if (!userData) {
      throw new Err(`User with id ${id} not found.`, "USER_NOT_FOUND");
    }

    let credentials;
    try {
      credentials = JSON.parse(this.cipher.decryptWPW(userData.credentials, password));
    } catch (err) {
      throw Err.inherit(err, "AUTH_FAIL");
    }

    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    if (!credentials.token) {
      throw new Error("Missing token on credentials");
    }

    oAuth2Client.setCredentials(credentials.token);

    return Promise.resolve(this.connectionFactory.create(TConnection.GMAIL, oAuth2Client));
  }

  protected getConfig(key: string = ""): any {
    return this.config.get("mail_clients." + TMailClient.GMAIL + (key ? "." + key : ""));
  }

  protected setConfig(key: string, value: any): any {
    return this.config.set("mail_clients." + TMailClient.GMAIL + (key ? "." + key : ""), value);
  }

}
