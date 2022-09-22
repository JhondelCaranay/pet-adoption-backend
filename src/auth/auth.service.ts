import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthDto, ForgotPasswordDto, PasswordResetDto } from './dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as randomize from 'randomatic';
import { JwtService } from '@nestjs/jwt/dist';
import * as nodemailer from 'nodemailer';
import * as Vonage from '@vonage/server-sdk';
import { Tokens } from './utils/types';
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

  async forgotPassword(dto: ForgotPasswordDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        profile: true,
      },
    });

    // check if user not exist
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // generate random code
    const code = randomize('aA0', 8);
    // store hash of generated random code in database
    const hash_password_reset = await this.hashData(code);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedPWResetToken: hash_password_reset,
      },
    });

    // check if type is email or phone
    if (dto.type === 'email') {
      // nodemailer
      await this.sendToSMTP(dto.email, code);
    } else if (dto.type === 'phone') {
      // vonage
      await this.sendToSMS(user.profile.contact, code);
    }

    return {
      message: `We sent a code to your ${dto.type} to reset your password. Please check your ${dto.type}.`,
    };
  }

  async sendToSMTP(email: string, code: string) {
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
      to: `${email}`, // ["@gmail.com","@gmail.com"] list of receivers
      subject: 'Password Reset', // Subject line
      text: 'Password Reset', // plain text body
      html: `<div><b>Use this code to reset your password</b><br><p>code : ${code}</p></div>`, // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async sendToSMS(phone: string, code: string) {
    console.log('DEBUG 1');
    // @ts-ignore
    const vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
    });

    console.log('DEBUG 2');
    const from: string = 'Vonage APIs';
    if (phone.startsWith('0')) {
      phone = `63${phone.substring(1)}`;
    }
    const to: string = phone;
    const text: string = `Use this code to reset your password. CODE : ${code}\n`;

    vonage.message.sendSms(from, to, text, {}, (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        if (responseData.messages[0]['status'] === '0') {
          console.log('Message sent successfully.');
        } else {
          console.log(
            `Message failed with error: ${responseData.messages[0]['error-text']}`,
          );
          throw new ForbiddenException('Failed to send message.');
        }
      }
    });
  }

  async passwordReset(dto: PasswordResetDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // check if user not exist
    if (!user) {
      throw new ForbiddenException('Invalid Credentials');
    }

    // compare password reset token and hashed password reset token
    const isMatch = await bcrypt.compare(dto.code, user.hashedPWResetToken);
    console.log(isMatch);

    // check if not match
    if (!isMatch) {
      throw new ForbiddenException('Invalid Credentials');
    }

    // hash new password
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
