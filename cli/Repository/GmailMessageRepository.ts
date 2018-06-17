import YoutubeMessage from "../Model/YoutubeMessage";
import IYoutubeMessageRepository from "./IYoutubeMessageRepository";
import GmailConnection from "../Connection/GmailConnection";
import GmailMessageToYoutubeMessageTransformer from "../Transformer/GmailMessageToYoutubeMessageTransformer";
import IContainerInjection from "../Container/IContainerInjection";
import {Mixin} from "../Utils/Mixin";
import {Container} from "typedi";

@Mixin([IContainerInjection])
export default class GmailMessageRepository implements IYoutubeMessageRepository, IContainerInjection {

  public static YOUTUBE_EMAIL = "noreply@youtube.com";

  public static create(connection: GmailConnection, container: typeof Container): GmailMessageRepository {
    return new this(
      connection,
      container.get(GmailMessageToYoutubeMessageTransformer)
    );
  }

  protected connection: GmailConnection;
  protected transformer: GmailMessageToYoutubeMessageTransformer;

  protected cache: Map<string, YoutubeMessage> = new Map<string, YoutubeMessage>();

  constructor(connection: GmailConnection, transformer: GmailMessageToYoutubeMessageTransformer) {
    this.connection = connection;
    this.transformer = transformer;
  }

  public get(id: string): Promise<YoutubeMessage> {
    if (this.cache.has(id)) {
      return Promise.resolve(this.cache.get(id));
    }

    return this.connection.getMessageContent(id, {})
      .then((message: any) => {
        const yMessage = this.transformer.transform(message);
        return this.isYoutube(yMessage).then((yes: boolean) => {
          if (!yes) {
            throw new Error(`Message with ID ${id} is not from youtube.`);
          }

          this.cache.set(id, yMessage);
          return yMessage;
        });
      });
  }

  public list(after: YoutubeMessage = null, max: number = 20): Promise<YoutubeMessage[]> {
    const query: any = {
      maxResults: max,
      q: `from:${(this.constructor as any).YOUTUBE_EMAIL}`,
    };

    if (after) {
      query.q += " before:" + after.getTimestamp();
    }

    return this.connection.getMessages(query)
      .then(({messages}: {messages: any[]}) => {
        return Promise.all(messages.map((message: any) => this.get(message.id)));
      });
  }

  public remove(message: YoutubeMessage): Promise<boolean> {
    return this.connection.removeMessage(message.getId(), {})
      .then((resp: any) => !!resp);
  }

  public isYoutube(message: YoutubeMessage): Promise<boolean> {
    return Promise.resolve(message.getSender() === (this.constructor as any).YOUTUBE_EMAIL);
  }

}
