import YousubsCommand from "../Util/YousubsCommand";
const iohook = require("iohook");

export default class YousubsSocket {

  public static create(socket: any): void {
    const socketInstance: any = new this(socket);
    this.openSockets.push(socketInstance);
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

  protected static history: any[] = [];
  protected static likes: any[] = [];
  protected static openSockets: YousubsSocket[] = [];

  protected socket: any;
  protected session: any;
  protected musicList: any = [];
  protected atTrack: number = -1;

  constructor(socket: any) {
    this.socket = socket;
    this.session = socket.handshake.session;

    if (this.session.user) {
      this.acquireNextList();
      socket.on("set next", this.setNext.bind(this));
      socket.on("save history", this.saveHistory.bind(this));
      socket.on("save like", this.saveLike.bind(this));

      socket.emit("history", YousubsSocket.history);
      socket.emit("likes", YousubsSocket.likes);
    } else {
      console.error("Socket io initialized without session.");
    }
  }

  public getSocket() {
    return this.socket;
  }

  public setNext(): void {
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
    if (!YousubsSocket.likes.find((l) => l.videoId === like.videoId)) {
      YousubsSocket.likes.push(like);
    }
  }

  public saveHistory(history: any) {
    if (!YousubsSocket.likes.find((l) => l.videoId === history.videoId)) {
      YousubsSocket.history.push(history);
    }
  }

  public like(): void {
    this.socket.emit("like");
  }

  public forward(): void {
    this.socket.emit("forward");
  }

  protected acquireNextList(): void {
    YousubsCommand.execute("list-emails", this.session.user.id, this.session.user.password, "-m", this.session.user.client)
      .then((output) => {
        this.musicList = JSON.parse(output);
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
// CTRL + ALT + RIGHT
iohook.registerShortcut([29, 56, 61005], () => {
  YousubsSocket.forwardAll();
});
// CTRL + ALT + NUM0
iohook.registerShortcut([29, 56, 82], () => {
  YousubsSocket.likeAll();
});

iohook.start();
