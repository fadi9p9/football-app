import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }
  
  @Post('verify-otp')
async verifyOtp(@Body() dto: VerifyOtpDto) {
  return this.authService.verifyOtp(dto);
}

@Post('login')
async login(@Body() dto: LoginDto) {
return this.authService.login(dto.email, dto.password);
}

}
