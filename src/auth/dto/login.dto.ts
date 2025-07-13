import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صالحًا' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصية' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تحتوي على الأقل على 8 أحرف' })
  @MaxLength(32, { message: 'كلمة المرور يجب ألا تتجاوز 32 حرفًا' })
  password: string;
}