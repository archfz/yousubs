export default interface ITransformer<W, T> {

  /**
   * Transform object.
   *
   * @param {W} object
   * @returns {T}
   */
  transform(object: W): T;

}
