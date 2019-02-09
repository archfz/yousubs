import {google} from "googleapis";

const SCOPES = ["https://mail.google.com/"];

export default class Gmail {

  public static getTokenLink(credentials: any): Promise<string> {
    return new Promise((resolve: any) => {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      resolve(authUrl);
    });
  }

}
