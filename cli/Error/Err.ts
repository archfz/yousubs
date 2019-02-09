export default class Err extends Error {

  public static inherit(err: any, code: string): Err {
    const error = new Err(err.message || err, code);

    if (err.stack) {
      error.stack = err.stack;
    }

    return error;
  }

  public code: string;

  constructor(message: string, code: string = "GENERIC") {
    super(message);
    this.code = code;
  }

}
