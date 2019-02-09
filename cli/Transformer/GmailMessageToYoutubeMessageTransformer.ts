import ITransformer from "./ITransformer";
import YoutubeMessage from "../Model/YoutubeMessage";

export default class GmailMessageToYoutubeMessageTransformer implements ITransformer<any, YoutubeMessage> {

  public transform(object: any): YoutubeMessage {
    const data = Buffer.from(object.payload.parts[0].body.data, "base64").toString();

    const message = new YoutubeMessage()
      .setId(object.id)
      .setTimestamp(object.internalDate)
      .setSender(this.getHeader("From", object).match(/<([^>]+)>/)[1])
      .setTitle(this.getHeader("Subject", object))
      .setChannel(data.substr(0, data.indexOf("just uploaded")).trim());

    try {
      message.setVideoId(data.match(/watch\?v=([0-9A-Za-z_-]{11})/)[1]);
    } catch (e) {
      // NOOP.
    }

    return message;
  }

  protected getHeader(name: string, data: any): string {
    return data.payload.headers.find((header: any) => header.name === name)
      .value;
  }

}
