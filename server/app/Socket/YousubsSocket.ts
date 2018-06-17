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
    } else {
      console.error("Socket io initialized without session.");
    }
  }

  public getSocket() {
    return this.socket;
  }

  public setNext(): void {
    ++this.atTrack;

    if (this.atTrack >= this.musicList.length) {
      return this.acquireNextList();
    }

    this.socket.emit("set next", this.musicList[this.atTrack]);
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

iohook.registerShortcut([29, 56, 41], () => {
  YousubsSocket.setNextTrackAll();
});

iohook.start();
