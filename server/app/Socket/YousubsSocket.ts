import YousubsCommand from "../Util/YousubsCommand";
import ListenHistoryRepository from "../Repository/ListenHistoryRepository";
import {AxiosResponse} from "axios";
const axios = require("axios");
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
    this.session = socket.request.session;

    socket.on("disconnect", () => YousubsSocket.remove(this));
    setInterval(() => this.checkSession(), this.session.cookie.maxAge);

    if (this.session.user) {
      this.acquireNextList();
      socket.on("set next", this.setNext.bind(this));
      socket.on("save history", this.saveHistory.bind(this));
      socket.on("save like", this.saveLike.bind(this));
      socket.on("remove like", this.removeLike.bind(this));

      this.listenRepo = new ListenHistoryRepository(this.session.user.id);
      this.session.user.history = this.listenRepo.getHistory();
      this.session.user.likes = this.listenRepo.getLikes();

      this.migrateTrackChannelInfo(this.session.user.likes)
        .then(() => {
          socket.emit("history", this.session.user.history);
          socket.emit("likes", this.session.user.likes);

          YousubsSocket.openSockets.push(this);
        }).catch(console.error);
    } else {
      console.error("Socket io initialized without session.");
    }
  }

  protected checkSession() {
    this.session.regenerate(  () => {
      this.socket.emit('loggedout', { timeout: 'true' });
    });
  }

  public getSocket() {
    return this.socket;
  }

  public setNext(): void {
    if (!this.session.user) {
      this.socket.emit("loggedout");
      return;
    }

    const lastTrack: any = this.musicList[this.atTrack];

    Promise.resolve().then(() => {
      ++this.atTrack;
      if (this.atTrack >= this.musicList.length) {
        this.acquireNextList();
      } else {
        this.socket.emit("set next", this.musicList[this.atTrack]);
      }

      if (lastTrack) {
        return YousubsCommand.execute("remove-email", this.session.user.id, this.session.user.password, lastTrack.id, "-m", this.session.user.client)
      }
    })
      .catch(console.error);
  }

  public saveLike(like: any) {
    if (!this.session.user) {
      this.socket.emit("loggedout");
      return;
    }

    this.appendChannelInfo(like)
      .then((like) => {
        if (!this.session.user.likes.find((l: any) => l.videoId === like.videoId)) {
          this.session.user.likes.push(like);
          this.listenRepo.saveLikes(this.session.user.likes);
          this.socket.emit("like added", like);
        }
      })
      .catch(console.error);
  }

  public migrateTrackChannelInfo(tracks: any[]): Promise<any> {
    let promise: any[] = tracks.map((track: any) => {
      if (!track.channelUser) {
        return this.appendChannelInfo(track);
      } else {
        return Promise.resolve(track);
      }
    });

    return Promise.all(promise).then((tracks) => this.listenRepo.saveLikes(tracks));
  }

  public appendChannelInfo(track: any): Promise<any> {
    return axios.get('https://www.youtube.com/watch?v=' + track.videoId)
      .then((response: AxiosResponse) => {
        const match = response.data.match(/"\/user\/([^"]+)"/);
        track.channelUser = match[1];

        return track;
      });
  }

  public removeLike(like: any) {
    if (!this.session.user) {
      this.socket.emit("loggedout");
      return;
    }

    const index = this.session.user.likes.findIndex((l: any) => l.videoId === like.videoId);
    if (index) {
      this.session.user.likes.splice(index, 1);
      this.listenRepo.saveLikes(this.session.user.likes);
    }
  }

  public saveHistory(history: any) {
    if (!this.session.user) {
      this.socket.emit("loggedout");
      return;
    }

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
// CTRL + ALT + PAGE UP
iohook.registerShortcut([29, 56, 61001], () => {
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
