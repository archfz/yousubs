import YoutubeMessage from "../Model/YoutubeMessage";

export default interface IYoutubeMessageRepository {

  /**
   * Determines if email is from youtube.
   *
   * @param {YoutubeMessage} message
   * @returns {Promise<boolean>}
   */
  isYoutube(message: YoutubeMessage): Promise<boolean>;

  /**
   * Gets message by ID.
   *
   * @param {string} id
   * @returns {Promise<YoutubeMessage>}
   */
  get(id: string): Promise<YoutubeMessage>;

  /**
   * Lists messages in date descending order.
   *
   * @param {YoutubeMessage} before
   *   After which message to list.
   *   @param {number} max
   * @returns {Promise<YoutubeMessage[]>}
   */
  list(before: YoutubeMessage, max?: number): Promise<YoutubeMessage[]>;

  /**
   * Removes a message.
   *
   * @param {YoutubeMessage} message
   * @returns {Promise<boolean>}
   */
  remove(message: YoutubeMessage): Promise<boolean>;

}
