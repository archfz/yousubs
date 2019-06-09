import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import * as path from "path";
import {IndexController} from "./app/Controller/IndexController";
import * as session from "express-session";
import {AuthController} from "./app/Controller/AuthController";
import YousubsSocket from "./app/Socket/YousubsSocket";
import * as os from "os";
import * as fs from "fs";

const SESSION_PATH = os.homedir() + "/.config/configstore/mail-yousubs-sessions";

class Server {

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  protected app: express.Application;

  protected session: any;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.api();
  }

  public initSocketIo(server: any) {
    // listen for sockets
    const io = require("socket.io")(server);

    io.use((socket: any, next: any) => {
      this.session(socket.request, {}, next);
    });

    io.on("connection", (socket: any) => YousubsSocket.create(socket));
  }

  protected configure(): any {
    this.app.use(express.static(path.join(__dirname, "../public")));

    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "pug");

    this.app.use(logger("dev"));

    this.app.use(bodyParser.json());

    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    this.app.use(cookieParser("SECRET_GOES_HERE"));

    this.app.set("trust proxy", 1);

    try {
      fs.mkdirSync(SESSION_PATH);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    var FileStore = require('session-file-store')(session);
    this.session = session({
      name : "app.sid",
      secret: "keyboard cat",
      resave: false,
      store: new FileStore({path: SESSION_PATH, ttl: 3600000 * 24,}),
      saveUninitialized: true,
      cookie: {
        maxAge: 3600000 * 24,
        httpOnly: false
      }
    });
    this.app.use(this.session);

    this.app.use(methodOverride());

    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      err.status = 404;
      next(err);
    });

    this.app.use(errorHandler());
  }

  protected routes(): any {
    let router: express.Router;
    router = express.Router();

    IndexController.register(router);
    AuthController.register(router);

    this.app.use(router);
  }

  protected api(): any {
    // noop.
  }

}

export default Server;
