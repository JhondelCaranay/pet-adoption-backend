import { AuthDto } from './dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt/dist';
@Injectable()
export class AuthService {
  // JwtService come from JwtModule.register({})
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async updateRtHash(userId: number, refreshToken: string) {
    // hash refresh token
    const hash = await this.hashData(refreshToken);

    // update user hashed refresh token
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }

  async signup(dto: AuthDto): Promise<Tokens> {
    //hash password
    const hash = await this.hashData(dto.password);

    // create user
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });

    // delete newUser.hash; // remove hash from response
    // delete newUser.hashedRefreshToken;
    // return newUser;

    // generate access token and refresh token
    const getTokens = this.getTokens(newUser.id, newUser.email, newUser.role);

    // update user hashed refresh token
    await this.updateRtHash(newUser.id, getTokens.refresh_token);

    return getTokens;
  }

  async signin(dto: AuthDto): Promise<Tokens> {
    // find user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // check if user not exist
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // compare password and hashed password
    const isMatch = await bcrypt.compare(dto.password, user.hash);

    // check if not match
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    // generate access token and refresh token
    const getTokens = this.getTokens(user.id, user.email, user.role);

    // update user hashed refresh token
    await this.updateRtHash(user.id, getTokens.refresh_token);

    return getTokens;
  }

  async signout(userId: number): Promise<boolean> {
    // update user hashed refresh token
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    return true;
  }

  async refresh(userId: number, refreshToken: string): Promise<Tokens> {
    // find user
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // check if user not exist or hashed refresh token not exist
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access denied');
    }

    // compare refresh token and hashed refresh token
    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    // check if not match
    if (!isMatch) {
      throw new ForbiddenException('Access denied');
    }

    // generate new access token and refresh token
    const getTokens = this.getTokens(user.id, user.email, user.role);

    // update user hashed refresh token
    await this.updateRtHash(user.id, getTokens.refresh_token);

    return getTokens;
  }

  async hashData(data: string) {
    // salt
    const salt = await bcrypt.genSalt(10);
    // hash
    return await bcrypt.hash(data, salt);
  }

  getTokens(userId: number, email: string, role: string) {
    // generate access token
    const access_token = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      },
    );

    // generate refresh token
    const refresh_token = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      },
    );

    return {
      access_token,
      refresh_token,
    };
  }
}

// return await this.prisma.user.update({
//   where: { id: userId },
//   data: { hashedRefreshToken: null },
// });

// await this.prisma.user.updateMany({
//   where: {
//     AND: [
//       {
//         id: {
//           equals: userId,
//         },
//       },
//       {
//         hashedRefreshToken: {
//           not: null,
//         },
//       },
//     ],
//   },
//   data: {
//     hashedRefreshToken: null,
//   },
// });
// return true;
