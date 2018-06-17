import {Service} from "typedi";
import * as crypto from "crypto";

@Service()
export default class Crypto {

  public static ALGO = "aes-256-cbc";

  /**
   * Decrypts text with password.
   *
   * @param {string} text
   * @param {string} password
   * @returns {string}
   */
  public decryptWPW(text: string, password: string): string {
    const parts = text.split(":");
    const iv = Buffer.from(parts.pop(), "hex");
    const key = crypto
      .createHash("sha256")
      .update(password)
      .digest().slice(0, 32);

    text = parts.join(":");

    const decipher = crypto.createDecipheriv((this.constructor as any).ALGO , key, iv);
    const dec = decipher.update(text, "hex");
    return Buffer.concat([dec, decipher.final()]).toString();
  }

  /**
   * Encrypts text with password.
   *
   * @param {string} text
   * @param {string} password
   * @returns {string}
   */
  public encryptWPW(text: string, password: string): string {
    const iv: Buffer = crypto.pseudoRandomBytes(16);
    const key = crypto
      .createHash("sha256")
      .update(password)
      .digest().slice(0, 32);

    const cipher = crypto.createCipheriv((this.constructor as any).ALGO , key, iv);
    const dec = cipher.update(text, "utf8", "hex");
    return dec + cipher.final("hex") + ":" +
      iv.toString("hex");
  }

}
