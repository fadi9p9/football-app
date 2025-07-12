import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'Kg4AGoIgYsIMhXDnEI7fhS5pxzGL29rJfS32wqAzng0=', 
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
