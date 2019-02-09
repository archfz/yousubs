import { NextFunction, Request, Response, Router } from "express";
import { BaseController } from "./BaseController";
import Auth from "../Authentication/Auth";

/**
 * / route
 *
 * @class User
 */
export class IndexController extends BaseController {

  /**
   * Create the routes.
   *
   * @class IndexController
   * @method register
   * @static
   */
  public static register(router: Router) {
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      new IndexController().index(req, res, next);
    });
  }

  /**
   * Constructor
   *
   * @class IndexController
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * The home page route.
   *
   * @class IndexController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public index(req: Request, res: Response, next: NextFunction) {
    this.title = "Home";
    this.addScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js");
    this.addScript("asset/js/main.js");
    this.addScript("http://www.youtube.com/player_api");

    if (!Auth.isLoggedIn(req.session)) {
      return res.redirect("/login");
    }

    this.render(req, res, "pages/index", {});
  }
}
