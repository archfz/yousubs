const configstore: any = new (require("configstore"))("mail-yousubs-server");

export default class ListenHistoryRepository {

  protected userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  saveLikes(likes: any[]) {
    configstore.set(`${this.userId}:likes`, likes);
  }

  getLikes(): any[] {
    return configstore.get(`${this.userId}:likes`) || [];
  }

  saveHistory(history: any[]) {
    configstore.set(`${this.userId}:history`, history);
  }

  getHistory(): any[] {
    return configstore.get(`${this.userId}:history`) || [];
  }

}