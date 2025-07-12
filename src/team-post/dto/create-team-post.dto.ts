export class CreateTeamPostDto {
  title: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  missingPlayers: number;
  description?: string;
  image?: string | null; 
  phone?: string;
}
