import {Container, Service} from "typedi";
import IContainerInjection from "../Container/IContainerInjection";
import {implementsMixin} from "../Utils/Mixin";
import IFactory from "./IFactory";

@Service()
export default class ContainerInjectionFactory implements IFactory<any> {

  /**
   * @inheritDoc
   */
  public create<T>(type: any, ...args: any[]): T {
    if (implementsMixin(type, IContainerInjection)) {
      return type.create(...args, Container) as T;
    }

    return new type(...args);
  }

}
