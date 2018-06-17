import { NextFunction, Request, Response } from "express";

/**
 * Constructor
 *
 * @class BaseController
 */
export class BaseController {

  protected title: string;

  private scripts: string[] = [];
  private styles: string[] = [];

  /**
   * Constructor
   *
   * @class BaseController
   * @constructor
   */
  constructor() {
    this.title = "Base route";
  }

  /**
   * Add a JS external file to the request.
   *
   * @class BaseController
   * @method addScript
   * @param src {string} The src to the external JS file.
   * @return {BaseController} Self for chaining
   */
  public addScript(src: string): BaseController {
    this.scripts.push(src);
    return this;
  }

  public addStyle(src: string): BaseController {
    this.styles.push(src);
    return this;
  }

  /**
   * Render a page.
   *
   * @class BaseController
   * @method render
   * @param req {Request} The request object.
   * @param res {Response} The response object.
   * @param view {String} The view to render.
   * @param options {Object} Additional options to append to the view's local scope.
   * @return void
   */
  public render(req: Request, res: Response, view: string, options: any = {}) {
    res.locals.BASE_URL = "/";

    res.locals.styles = this.styles;
    res.locals.scripts = this.scripts;
    res.locals.title = "Yousubs - " + this.title;

    res.render(view, options);
  }

}
