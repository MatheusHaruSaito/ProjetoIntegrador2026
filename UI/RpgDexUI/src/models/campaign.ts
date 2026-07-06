export interface Campaign {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  gameMasterId: string;
  iconPath: string;
  maxPlayers: number;
  playerIds?: string[];
  characterIds?: string[];
}
