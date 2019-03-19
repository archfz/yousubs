"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const errorHandler = require("errorhandler");
const methodOverride = require("method-override");
const path = require("path");
const IndexController_1 = require("./app/Controller/IndexController");
const session = require("express-session");
const AuthController_1 = require("./app/Controller/AuthController");
const YousubsSocket_1 = require("./app/Socket/YousubsSocket");
class Server {
    static bootstrap() {
        return new Server();
    }
    constructor() {
        this.app = express();
        this.configure();
        this.routes();
        this.api();
    }
    initSocketIo(server) {
        const io = require("socket.io")(server);
        const ios = require("socket.io-express-session");
        io.use(ios(this.session));
        io.on("connection", (socket) => YousubsSocket_1.default.create(socket));
    }
    configure() {
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
        this.session = session({
            name: "app.sid",
            secret: "keyboard cat",
            resave: false,
            store: new session.MemoryStore(),
            saveUninitialized: true,
            cookie: {
                maxAge: 3600000 * 24
            }
        });
        this.app.use(this.session);
        this.app.use(methodOverride());
        this.app.use((err, req, res, next) => {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
    }
    routes() {
        let router;
        router = express.Router();
        IndexController_1.IndexController.register(router);
        AuthController_1.AuthController.register(router);
        this.app.use(router);
    }
    api() {
    }
}
exports.default = Server;
//# sourceMappingURL=index.js.map