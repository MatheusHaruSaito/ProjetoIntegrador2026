import { tokenModel } from './tokenMode';
export interface LoginResponse {
  refreshTokenModel: tokenModel;
  twoFactorEnabled: boolean;
  email: string;
}
