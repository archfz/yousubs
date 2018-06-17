import IFactory from "./IFactory";
import IConnection from "../Connection/IConnection";
import {TConnection} from "../Type/TConnection";
import GmailConnection from "../Connection/GmailConnection";
import ContainerInjectionFactory from "./ContainerInjectionFactory";
import {Service} from "typedi";

@Service()
export default class ConnectionFactory implements IFactory<IConnection> {

  protected injectionFactory: ContainerInjectionFactory;

  constructor(injectionFactory: ContainerInjectionFactory) {
    this.injectionFactory = injectionFactory;
  }

  public create(type: TConnection = TConnection.GMAIL, auth: any): IConnection {
    switch (type) {
      case TConnection.GMAIL:
        return this.injectionFactory.create(GmailConnection, auth);

      default:
        throw new Error(`Undefined connection '${type}'.`);
    }
  }

}