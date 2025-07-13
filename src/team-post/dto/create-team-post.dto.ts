import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTeamPostDto {
  @IsString()
  title: string;

  @IsString()
  location: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  duration: string;

  @IsNumber()
  missingPlayers: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  image?: string | null;
}

export class UpdateTeamPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsNumber()
  missingPlayers?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

   @IsOptional()
  @IsString()
  image?: string | null;
}