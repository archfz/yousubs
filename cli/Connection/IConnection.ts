export default interface IConnection {

  /**
   * Gets messages.
   *
   * @param query
   * @returns {Promise<any>}
   */
  getMessages(query: any): Promise<any>;

  /**
   * Get messages.
   *
   * @param query
   * @returns {Promise<any>}
   */
  getMessages(query: any): Promise<any>;

  /**
   * Gets message content.
   *
   * @param {string} id
   * @param query
   * @returns {Promise<any>}
   */
  getMessageContent(id: string, query: any): Promise<any>;

  /**
   * Removes a message.
   *
   * @param {string} id
   * @param query
   * @returns {Promise<boolean>}
   */
  removeMessage(id: string, query: any): Promise<boolean>;

}
