import Err from "./Err";

export default class MailNotFoundError extends Err {
  constructor(message: string, code: string = "MAIL-NOT-FOUND") {
    super(message, code);
  }
}
