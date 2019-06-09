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
const os = require("os");
const fs = require("fs");
const SESSION_PATH = os.homedir() + "/.config/configstore/mail-yousubs-sessions";
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
        io.use((socket, next) => {
            this.session(socket.request, {}, next);
        });
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
        try {
            fs.mkdirSync(SESSION_PATH);
        }
        catch (err) {
            if (err.code !== 'EEXIST')
                throw err;
        }
        var FileStore = require('session-file-store')(session);
        this.session = session({
            name: "app.sid",
            secret: "keyboard cat",
            resave: false,
            store: new FileStore({ path: SESSION_PATH, ttl: 3600000 * 24, }),
            saveUninitialized: true,
            cookie: {
                maxAge: 3600000 * 24,
                httpOnly: false
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