import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
     private readonly jwtService: JwtService, 
  ) {}

 async login(email: string, password: string) {
  const user = await this.userRepo.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedException('Invalid credentials');
  }

  if (!user.isVerified) {
    throw new BadRequestException('Please verify your account with OTP');
  }

  const payload = { id: user.id };
  const token = this.jwtService.sign(payload);

  user.currentToken = token;
  await this.userRepo.save(user);

  return {
    message: 'Login successful',
    token,
    user,
  };
}




  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
      otpCode: hashedOtp,
      otpExpiry,
    });

    await this.userRepo.save(user);

    await this.mailService.sendOtpEmail(email, otpCode);

    return { message: 'User created, OTP sent to email.' };
  }

 async verifyOtp({ email, otpCode }: VerifyOtpDto) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    const isOtpValid = user.otpCode
      ? await bcrypt.compare(otpCode, user.otpCode)
      : false;

    if (!isOtpValid) throw new BadRequestException('Invalid OTP');

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    user.otpCode = null;
    user.otpExpiry = null;
    user.isVerified = true;
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    user.currentToken = token;
    await this.userRepo.save(user);

    const { password, otpCode: _, otpExpiry, ...userData } = user; 

    return { user: userData, access_token: token };
  }


  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
