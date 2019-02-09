export default interface IFactory<T> {

  /**
   * Creates the object.
   *
   * @param args
   * @returns {T}
   */
  create(...args: any[]): T;

}
