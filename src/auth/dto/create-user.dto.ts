export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  skill?: string;
  language?: 'en' | 'ar';
}