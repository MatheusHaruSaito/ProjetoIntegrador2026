export interface CreateCharacter {
  userId: string;
  icon: File;
  name: string;
  description?: string;
  properties?: Record<string, any>;
}
