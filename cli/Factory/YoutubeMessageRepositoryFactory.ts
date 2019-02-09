import GmailMessageRepository from "../Repository/GmailMessageRepository";
import IYoutubeMessageRepository from "../Repository/IYoutubeMessageRepository";
import IFactory from "./IFactory";
import {Service} from "typedi";
import ContainerInjectionFactory from "./ContainerInjectionFactory";
import {TMessageRepository} from "../Type/TMessageRepository";
import IConnection from "../Connection/IConnection";

@Service()
export default class YoutubeMessageRepositoryFactory implements IFactory<IYoutubeMessageRepository> {

  protected injectionFactory: ContainerInjectionFactory;

  constructor(injectionFactory: ContainerInjectionFactory) {
    this.injectionFactory = injectionFactory;
  }

  /**
   * Creates message repository.
   *
   * @param {TMessageRepository} type
   * @param {IConnection} clientConnection
   * @param {any[]} args
   */
  public create(
    type: TMessageRepository = TMessageRepository.GMAIL,
    clientConnection: IConnection,
    ...args: any[]): IYoutubeMessageRepository {

    switch (type) {
      case TMessageRepository.GMAIL:
        return this.injectionFactory.create(GmailMessageRepository, clientConnection);

      default:
        throw new Error(`Undefined repository '${type}'.`);
    }
  }

}
