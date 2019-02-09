import YousubsCommand from "../Util/YousubsCommand";
import ListenHistoryRepository from "../Repository/ListenHistoryRepository";
const iohook = require("iohook");
const desktopIdle = require("desktop-idle");

const MAX_IDLE_TIME = 1000 * 60;

export default class YousubsSocket {

  public static create(socket: any): void {
    const socketInstance: any = new this(socket);
  }

  public static remove(socket: any): void {
    this.openSockets.splice(this.openSockets.indexOf(socket), 1);
  }

  public static setNextTrackAll() {
    this.openSockets.forEach((socket: YousubsSocket) => {
      socket.setNext();
    });
  }

  public static likeAll() {
    this.openSockets.forEach((socket: YousubsSocket) => {
      socket.like();
    });
  }

  public static forwardAll() {
    this.openSockets.forEach((socket: YousubsSocket) => {
      socket.forward();
    });
  }

  public static pauseAll() {
    this.openSockets.forEach((socket: YousubsSocket) => {
      socket.pause();
    });
  }

  protected static openSockets: YousubsSocket[] = [];

  protected socket: any;
  protected session: any;
  protected musicList: any = [];
  protected atTrack: number = -1;
  protected listenRepo: ListenHistoryRepository;

  constructor(socket: any) {
    this.socket = socket;
    this.session = socket.handshake.session;

    socket.on("disconnect", () => YousubsSocket.remove(this));

    if (this.session.user) {
      this.acquireNextList();
      socket.on("set next", this.setNext.bind(this));
      socket.on("save history", this.saveHistory.bind(this));
      socket.on("save like", this.saveLike.bind(this));

      this.listenRepo = new ListenHistoryRepository(this.session.user.id);
      this.session.user.history = this.listenRepo.getHistory();
      this.session.user.likes = this.listenRepo.getLikes();

      socket.emit("history", this.session.user.history);
      socket.emit("likes", this.session.user.likes);

      YousubsSocket.openSockets.push(this);
    } else {
      console.error("Socket io initialized without session.");
    }
  }

  public getSocket() {
    return this.socket;
  }

  public setNext(): void {
    this.session.touch();

    const lastTrack: number = this.atTrack;
    ++this.atTrack;

    if (lastTrack > -1) {
      YousubsCommand.execute("remove-email", this.session.user.id, this.session.user.password, this.musicList[lastTrack].id, "-m", this.session.user.client)
        .catch(console.error);
    }

    if (this.atTrack >= this.musicList.length) {
      return this.acquireNextList();
    }

    this.socket.emit("set next", this.musicList[this.atTrack]);
  }

  public saveLike(like: any) {
    if (!this.session.user.likes.find((l: any) => l.videoId === like.videoId)) {
      this.session.user.likes.push(like);
      this.listenRepo.saveLikes(this.session.user.likes);
    }
  }

  public saveHistory(history: any) {
    if (!this.session.user.history.find((l: any) => l.videoId === history.videoId)) {
      this.session.user.history.push(history);
      this.listenRepo.saveHistory(this.session.user.history);
    }
  }

  public like(): void {
    this.socket.emit("like");
  }

  public forward(): void {
    this.socket.emit("forward");
  }

  public pause(): void {
    this.socket.emit("pause");
  }

  protected acquireNextList(): void {
    if (!this.session.user) {
      this.socket.emit("loggedout");
    }

    YousubsCommand.execute("list-emails", this.session.user.id, this.session.user.password, "-m", this.session.user.client)
      .then((output) => {
        try {
          this.musicList = JSON.parse(output);
        } catch (e) {
          console.log("Failed parsing json: ");
          console.log(output);
          throw e;
        }

        this.atTrack = -1;
        this.setNext();
      })
      .catch(console.error);
  }

}

// CTRL + ALT + `
iohook.registerShortcut([29, 56, 41], () => {
  YousubsSocket.setNextTrackAll();
});
// CTRL + ALT + (NUM)Del
iohook.registerShortcut([29, 56, 83], () => {
  YousubsSocket.forwardAll();
});
// CTRL + ALT + *
iohook.registerShortcut([29, 56, 55], () => {
  YousubsSocket.likeAll();
});

iohook.start();

// Check every 5 seconds for IDLE and stop the player if
// max is reached.
setInterval(() => {
  if (desktopIdle.getIdleTime() * 1000 > MAX_IDLE_TIME) {
    YousubsSocket.pauseAll();
  }
}, 1000 * 5);
