import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthDto, EmailDto, PasswordResetDto } from './dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt/dist';
import * as nodemailer from 'nodemailer';
@Injectable()
export class AuthService {
  // JwtService come from JwtModule.register({})
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(dto: AuthRegisterDto): Promise<Tokens> {
    //hash password
    const hash = await this.hashData(dto.password);

    // create user
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
        profile: {
          create: {
            fist_name: dto.first_name,
            last_name: dto.last_name,
            contact: dto.contact,
            address: dto.address,
            gender: dto.gender,
            age: dto.age,
          },
        },
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

  async forgotPassword(dto: EmailDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // check if user not exist
    if (!user) {
      throw new ForbiddenException('Invalid email');
    }
    // generate password reset token
    const password_reset_token = await this.getPasswordResetToken(user.email);
    const hash_password_reset_token = await this.hashData(password_reset_token);
    // update user password reset token
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedPWResetToken: hash_password_reset_token,
      },
    });
    console.log(user);
    // node mailer
    let transporter = await nodemailer.createTransport({
      service: 'gmail',
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    //CLIENT_APP
    let mailOptions = {
      from: `"<${process.env.GMAIL_EMAIL}>`, // sender address
      to: `${dto.email}`, // ["@gmail.com","@gmail.com"] list of receivers
      subject: 'Password Reset', // Subject line
      text: 'Password Reset', // plain text body
      html: `<div><b>Plase click the link below to reset your password</b><br><a href="${process.env.CLIENT_APP}reset-password?token=${password_reset_token}">Reset Password</a></div>`, // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return {
      message:
        'We sent to your email a link to reset your password. Please check your email',
    };
  }

  async passwordReset(dto: PasswordResetDto) {
    // decode token
    // process.env.PASSWORD_RESET_TOKEN_SECRET,
    try {
      const decodedToken = await this.jwtService.verifyAsync(
        dto.password_reset_token,
        {
          secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
        },
      );

      // find user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: decodedToken.email,
        },
      });

      // check if user not exist
      if (!user) {
        throw new ForbiddenException('Invalid token');
      }

      // compare password reset token and hashed password reset token
      const isMatch = await bcrypt.compare(
        dto.password_reset_token,
        user.hashedPWResetToken,
      );

      // check if not match
      if (!isMatch) {
        throw new ForbiddenException('Invalid token');
      }

      // hash password
      const hash = await this.hashData(dto.new_password);

      // update user password
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hash,
          hashedPWResetToken: null,
        },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }

  async updateRtHash(userId: number, refreshToken: string) {
    // hash refresh token
    const hash = await this.hashData(refreshToken);

    // update user hashed refresh token
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
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

  getPasswordResetToken(email: string) {
    // generate access token
    const password_reset_token = this.jwtService.sign(
      {
        email,
      },
      {
        expiresIn: '10m',
        secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
      },
    );
    return password_reset_token;
  }
}
