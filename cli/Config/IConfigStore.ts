export default interface IConfigStore {

  set(key: string, value: any): any;

  get(key: string): any;

  has(key: string): boolean;

}
