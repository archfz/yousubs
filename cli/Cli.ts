import {Inject, Service} from "typedi";
import ClientFactory from "./Factory/ClientFactory";
import YoutubeMessageRepositoryFactory from "./Factory/YoutubeMessageRepositoryFactory";
import {TOptions} from "./Type/TOptions";
import YoutubeMessage from "./Model/YoutubeMessage";
import IYoutubeMessageRepository from "./Repository/IYoutubeMessageRepository";
import {Defaults} from "./Enum/Defaults";

@Service()
export default class Cli {

  @Inject()
  protected clientFactory: ClientFactory;

  @Inject()
  protected messageRepoFactory: YoutubeMessageRepositoryFactory;

  public listAuths(options: any): Promise<string> {
    return this.clientFactory.create(options[TOptions.MAIL_CLIENT])
      .getAuthentications()
      .then((auths: string[]) => auths.join("\n"));
  }

  public hasAuth(id: string, options: any): Promise<string> {
    return this.clientFactory.create(options[TOptions.MAIL_CLIENT])
      .hasAuthentication(id)
      .then((has) => has ? "true" : "false");
  }

  public checkAuth(id: string, password: string, options: any): Promise<string> {
    return this.clientFactory.create(options[TOptions.MAIL_CLIENT])
      .connect(id, password)
      .then(() => "ok")
      .catch((err) => {
        if (err.code === "AUTH_FAIL") {
          return "fail";
        }

        throw err;
      });
  }

  public createAuth(id: string, password: string, credentials: string, options: any): Promise<string> {
    credentials = credentials.charAt(0) === "'" ? credentials.slice(1, -1) : credentials;

    return this.clientFactory.create(options[TOptions.MAIL_CLIENT])
      .createAuthentication(id, password, JSON.parse(credentials))
      .then((created) => {
        if (!created) {
          throw new Error(`Failed to create authentication.`);
        }

        return "created";
      });
  }

  public listEmails(id: string, password: string, options: any): Promise<string> {
    return this.clientFactory.create(options[TOptions.MAIL_CLIENT])
      .connect(id, password)
      .then((auth) => {
        const repo = this.messageRepoFactory.create(options[TOptions.MAIL_CLIENT], auth);
        return this.doListEmails(repo, options);
      })
      .then((messages: YoutubeMessage[]) => {
        return JSON.stringify(messages);
      });
  }

  protected doListEmails(repo: IYoutubeMessageRepository, options: any, max: number = Defaults.MAX_LIST_EMAILS): Promise<YoutubeMessage[]> {
    return repo.list(options[TOptions.BEFORE_EMAIL], max)
      .then((messages) => {
        // Send only messages that have video.
        const goodMessages = messages.filter((m) => m.getVideoId());

        if (goodMessages.length >= max) {
          return messages;
        }

        const promises = messages.filter((m) => !m.getVideoId())
          .map((m) => repo.remove(m));
        return Promise.all(promises)
          .then(() => {
            return this.doListEmails(repo, options, max - goodMessages.length)
              .then((additionMessages) => goodMessages.concat(additionMessages));
          })
      });
  }


  public removeEmail(id: string, password: string, emailIds: string, options: any): Promise<string> {
    return this.clientFactory.create(options[TOptions.MAIL_CLIENT])
      .connect(id, password)
      .then((auth) => this.messageRepoFactory.create(options[TOptions.MAIL_CLIENT], auth))
      .then((repo: IYoutubeMessageRepository) => {
        const promises = emailIds.split(",").map((emailId: string) => {
          return repo.remove(new YoutubeMessage().setId(emailId));
        });

        return Promise.all(promises);
      })
      .then((responses) => {
        const removeCount = responses.filter((res: boolean) => res == true).length;
        return "removed " + removeCount;
      });
  }

}
