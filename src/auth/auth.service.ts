import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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


async login(user: User) {
  const payload = {
    sub: user.id,
    username: user.name,
    iat: Math.floor(Date.now() / 1000)
  };

  const token = this.jwtService.sign(payload, {
    algorithm: 'HS256',
    secret: 'uLDovjBfWtwGoYJ0XT/mGDC0u7BSJnsgZ1JJJxTQE84='
  });

  // إرجاع التوكن مع بيانات المستخدم الكاملة (باستثناء الحساسة مثل كلمة المرور)
  return {
    access_token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      skill: user.skill,
      isVerified: user.isVerified,
      createdAt: user.createdAt
      // يمكنك إضافة أو إزالة الحقول حسب الحاجة
    }
  };
}



async validateUser(email: string, password: string): Promise<User> {
  const user = await this.userRepo.findOne({ where: { email } });
  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

  return user;
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

  async logout(userId: number) {
  try {
    await this.userRepo.update(userId, { currentToken: null });
    return { message: 'Logged out successfully' };
  } catch (error) {
    throw new InternalServerErrorException('Failed to logout');
  }
}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
