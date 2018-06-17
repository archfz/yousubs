import IConnection from "../Connection/IConnection";

export default interface IClient {

  /**
   * Gets all registered authentications.
   *
   * @returns {Promise<string[]>}
   */
  getAuthentications(): Promise<string[]>;

  /**
   * Checks if authentication exists.
   *
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  hasAuthentication(id: string): Promise<boolean>;

  /**
   * Creates new authentication.
   *
   * @param {string} id
   * @param {string} password
   * @param credentials
   * @returns {Promise<boolean>}
   */
  createAuthentication(id: string, password: string, credentials: any): Promise<boolean>;

  /**
   * Authenticates and connects to the connection.
   *
   * @param {string} id
   * @param {string} password
   * @returns {Promise<IConnection>}
   */
  connect(id: string, password: string): Promise<IConnection>;

}
