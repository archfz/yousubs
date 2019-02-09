export default class Auth {

  public static login(id: string, password: string, client: string, session: any): void {
    session.user = {id, password, client};

    session.save(() => true);
  }

  public static isLoggedIn(session: any): boolean {
    return session.user && session.user.id && session.user.password;
  }

}
