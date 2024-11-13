export class UserWithoutPassword {
  id: number;
  username: string;
  fullname: string;
  last_login: Date;
  refresh_token: string;
}

export class UserM extends UserWithoutPassword {
  password: string;
}
