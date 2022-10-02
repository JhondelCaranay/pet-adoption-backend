import { AuthRegisterDto } from './dto/auth-register.dto';
import {
  AuthDto,
  ConfirmResetCodeDto,
  ForgotPasswordDto,
  UpdatePasswordDto,
} from './dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as randomize from 'randomatic';
import { JwtService } from '@nestjs/jwt/dist';
import * as nodemailer from 'nodemailer';
import * as Vonage from '@vonage/server-sdk';
import { Tokens } from './utils/types';
import { ROLE } from '@prisma/client';
// import { hashData } from './utils/functions';

@Injectable()
export class AuthService {
  // JwtService come from JwtModule.register({})

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            fist_name: true,
            last_name: true,
            imageUrl: true,
            contact: true,
            address: true,
          },
        },
      },
    });

    return user;
  }
  async getUsers(search: string = '') {
    const users = await this.prisma.user.findMany({
      where: {
        role: ROLE.USER,
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            profile: {
              OR: [
                {
                  fist_name: {
                    contains: search,
                  },
                },
                {
                  last_name: {
                    contains: search,
                  },
                },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            fist_name: true,
            last_name: true,
            imageUrl: true,
            contact: true,
            address: true,
          },
        },
        createdAt: true,
      },
    });

    return users;
  }

  getUserById(userId: number) {
    const user = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            fist_name: true,
            last_name: true,
            imageUrl: true,
            contact: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async signup(dto: AuthRegisterDto): Promise<Tokens> {
    // if email exist
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // check if user exist
    if (user) {
      throw new ForbiddenException('Email already exist');
    }

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
    // find user with email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: dto.search,
          },
          {
            profile: {
              contact: dto.search,
            },
          },
        ],
      },
    });

    // check if user not exist
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // generate random code
    const password_reset_code = randomize('aA0', 8);

    // make the token expire in 5 minutes
    const password_reset_token = this.jwtService.sign(
      {
        id: user.id,
        password_reset_code,
      },
      {
        expiresIn: '1m',
        secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
      },
    );
    // save password_reset_token to database
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedPWResetToken: password_reset_token,
      },
    });

    // send code to email
    await this.sendToSMTP(user.email, password_reset_code);

    return {
      message: `We sent a code to your email to reset your password. Please check your email.`,
    };
  }

  async confirmResetCode(dto: ConfirmResetCodeDto) {
    // find user with email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: dto.search,
          },
          {
            profile: {
              contact: dto.search,
            },
          },
        ],
      },
    });
    // check if user not exist
    if (!user || !user.hashedPWResetToken) {
      throw new ForbiddenException('Invalid credentials');
    }

    // verify password_reset_token
    try {
      const decoded = this.jwtService.verify(user.hashedPWResetToken, {
        secret: process.env.PASSWORD_RESET_TOKEN_SECRET,
      });

      // check if password_reset_code not match
      if (decoded.password_reset_code !== dto.code) {
        throw new ForbiddenException('Invalid credentials');
      }

      // remove password_reset_token
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hashedPWResetToken: null,
        },
      });

      // generate tokens
      const getTokens = this.getTokens(user.id, user.email, user.role);

      // return tokens
      return getTokens;
    } catch (error) {
      throw new ForbiddenException(
        'Code is Invalid or Expired. Please request a new code.',
      );
    }
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    // update user password
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hash: await this.hashData(dto.password),
      },
    });

    return {
      message: 'Password updated successfully',
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
        throw new InternalServerErrorException('Something went wrong');
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async sendToSMS(phone: string, code: string) {
    // @ts-ignore
    const vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
    });

    const from: string = 'Vonage APIs';
    if (phone.startsWith('0')) {
      phone = `63${phone.substring(1)}`;
    }
    const to: string = phone;
    const text: string = `Use this code to reset your password. CODE : ${code}\n`;

    vonage.message.sendSms(from, to, text, {}, (err, responseData) => {
      if (err) {
        console.log(err);
        throw new InternalServerErrorException('Something went wrong');
      } else {
        if (responseData.messages[0]['status'] === '0') {
          console.log('Message sent successfully.');
        } else {
          console.log(
            `Message failed with error: ${responseData.messages[0]['error-text']}`,
          );
          throw new InternalServerErrorException('Something went wrong');
        }
      }
    });
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
        expiresIn: '1d',
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
