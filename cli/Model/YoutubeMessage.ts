export default class YoutubeMessage {

  private id: string;
  private videoId: string;
  private title: string;
  private channel: string;
  private timestamp: number;
  private sender: string;

  public getTimestamp(): number {
    return this.timestamp;
  }

  public setTimestamp(value: number) {
    this.timestamp = value;
    return this;
  }

  public getId(): string {
    return this.id;
  }

  public setId(value: string) {
    this.id = value;
    return this;
  }

  public getUrl(): string {
    return this.videoId;
  }

  public setVideoId(value: string) {
    this.videoId = value;
    return this;
  }

  public getVideoId(): string {
    return this.videoId;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(value: string) {
    this.title = value;
    return this;
  }

  public getChannel(): string {
    return this.channel;
  }

  public setChannel(value: string) {
    this.channel = value;
    return this;
  }

  public getSender(): string {
    return this.sender;
  }

  public setSender(value: string) {
    this.sender = value;
    return this;
  }

}
