import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // default is false
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }
  async validate(payload: JwtPayload) {
    console.log(payload);
    // payload is a decoded data from token
    return payload; // this will be stored in req.user
  }
}
