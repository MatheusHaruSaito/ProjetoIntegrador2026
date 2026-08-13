export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
  roles: string | string[];
  iconPath: string | undefined;
}
