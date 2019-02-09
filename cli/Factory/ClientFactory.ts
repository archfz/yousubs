import IFactory from "./IFactory";
import ContainerInjectionFactory from "./ContainerInjectionFactory";
import {Service} from "typedi";
import IClient from "../Client/IClient";
import {TMailClient} from "../Type/TMailClient";
import GmailClient from "../Client/GmailClient";

@Service()
export default class ClientFactory implements IFactory<IClient> {

  protected injectionFactory: ContainerInjectionFactory;

  constructor(injectionFactory: ContainerInjectionFactory) {
    this.injectionFactory = injectionFactory;
  }

  public create(type: TMailClient = TMailClient.GMAIL): IClient {
    switch (type) {
      case TMailClient.GMAIL:
        return this.injectionFactory.create(GmailClient);

      default:
        throw new Error(`Undefined client '${type}'.`);
    }
  }

}