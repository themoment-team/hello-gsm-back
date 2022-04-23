export interface AuthEmail {
  code: string;
  expiredAt: Date;
  confirm: boolean;
}
