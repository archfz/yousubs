import {Service} from "typedi";
import IConfigStore from "./IConfigStore";
const configstore: any = new (require("configstore"))("mail-yousubs");

@Service()
export default class ConfigStore implements IConfigStore {

  public set(key: string, value: any): any {
    return configstore.set(key, value);
  }

  public get(key: string): any {
    return configstore.get(key);
  }

  public has(key: string): boolean {
    return !!configstore.get(key);
  }

}
