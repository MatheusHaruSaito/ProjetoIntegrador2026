export interface Character {
  id: string;
  userId: string;
  iconPath: string;
  name: string;
  createdAt: Date;
  description?: string;
  properties?: Record<string, any>;
}
