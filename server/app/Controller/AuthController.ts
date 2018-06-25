import { NextFunction, Request, Response, Router } from "express";
import { BaseController } from "./BaseController";
import YousubsCommand from "../Util/YousubsCommand";
import Auth from "../Authentication/Auth";
import Gmail from "../Client/Gmail";

/**
 * / route
 *
 * @class User
 */
export class AuthController extends BaseController {

  /**
   * Create the routes.
   *
   * @class IndexController
   * @method register
   * @static
   */
  public static register(router: Router) {
    const self = new AuthController();

    router.get("/login", self.login.bind(self));
    router.post("/login", self.doLogin.bind(self));

    router.get("/register", self.register.bind(self));
    router.post("/register", self.doRegister.bind(self));
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

  public login(req: Request, res: Response, next: NextFunction) {
    this.title = "Login";

    YousubsCommand.execute("list-auth")
      .then((output: string) => {
        if (output === "") {
          res.redirect("/register");
        } else {
          this.render(req, res, "pages/login", {errors: {}});
        }
      }).catch(console.error);
  }

  public doLogin(req: Request, res: Response, next: NextFunction) {
    const {id, password, mailClient} = (req as any).body;
    const errors: any = {};

    if (!id) {
      errors.id = ["Id is required."];
    }
    if (!password) {
      errors.password = ["Password is required."];
    }

    if (Object.keys(errors).length) {
      return this.render(req, res, "pages/login", {
        input: {id},
        errors
      });
    }

    YousubsCommand.execute("check-auth", id, password, "-m", mailClient)
      .then((output: string) => {
        if (output !== "ok") {
          Auth.login(id, password, mailClient, req.session);
          res.redirect("/");
        } else {
          this.render(req, res, "pages/login", {
            input: {id},
            errors: {
              misc: `Invalid login credentials.`
            }
          });
        }
      })
      .catch((output: string) => {
        if (output.indexOf("USER_NOT_FOUND") !== -1) {
          this.render(req, res, "pages/login", {
            input: {id, mailClient},
            errors: {
              misc: `User with id '${id}' is not registered on ${mailClient} client.`
            }
          });

          return;
        }

        throw output;
      })
      .catch(console.error);
  }

  public register(req: Request, res: Response, next: NextFunction) {
    this.title = "Register";

    this.render(req, res, "pages/register", {
      errors: {},
      input: {
        mailClient: "gmail"
      }
    });
  }

  public doRegister(req: Request, res: Response, next: NextFunction) {
    const data: any = (req as any).body;
    const errors: any = {};

    if (!data.id) {
      errors.id = ["ID is required."];
    }
    if (!data.password && !req.session.reg_password) {
      errors.password = ["Password is required."];
    }
    if (data.password && data.password !== data.password_re) {
      errors.password_re = ["Password mismatch."];
    }
    if (!data.mailClient) {
      errors.mailClient = ["Mail client is required."];
    }

    if (!data.password && req.session.reg_password) {
      data.password = req.session.reg_password;
    } else if (data.password) {
      req.session.reg_password = data.password;
      req.session.save(() => console.log("saved"));
    }

    if (Object.keys(errors).length) {
      return this.render(req, res, "pages/register", {
        input: data,
        errors
      });
    }

    switch (data.mailClient) {
      case "gmail":
        let credentials: any;

        if (!data.credentials) {
          errors.credentials = ["Credentials is required."];
        } else {
          try {
            credentials = JSON.parse(data.credentials);
          } catch (e) {
            errors.credentials = ["Credentials must be a valid JSON."];
          }
        }

        if (Object.keys(errors).length) {
          return this.render(req, res, "pages/register", {
            input: data,
            errors
          });
        }

        if (data.token) {
          credentials.token = data.token;
          YousubsCommand.execute("add-auth",
            data.id, data.password, credentials,
            "-m", data.mailClient)
            .then((response) => {
              Auth.login(data.id, data.password, data.mailClient, req.session);
              res.redirect("/");
            })
            .catch(console.error);
        } else {
          Gmail.getTokenLink(credentials)
            .then((link) => {
              this.render(req, res, "pages/register", {
                input: data,
                token_link: link,
                errors
              });
            })
            .catch(console.error);
        }

        return;

      default:
        errors.gmailClient = ["Invalid client."];
    }

    if (Object.keys(errors).length) {
      return this.render(req, res, "pages/register", {
        input: data,
        errors
      });
    }
  }

}
