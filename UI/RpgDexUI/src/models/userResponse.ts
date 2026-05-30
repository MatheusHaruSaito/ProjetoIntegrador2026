export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  roles: string | string[];
  iconPath: string | undefined; 
}