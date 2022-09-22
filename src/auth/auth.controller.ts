import { RefreshTokenGuard } from './../common/guards';
import { AuthDto, AuthRegisterDto, EmailDto, PasswordResetDto } from './dto';
import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Tokens } from './types';
import {
  GetCurrentUser,
  GetCurrentUserID,
  Public,
  Roles,
} from 'src/common/decorators';
// import { AccessTokenGuard } from './../common/guards/accessToken.guard';
// import { Request } from 'express';
// import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // @Public() a custom decorator used to skip authentication
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthRegisterDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  @Public() // @Public() a custom decorator used to skip authentication
  @Post('signin')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  signin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  // old version @UseGuards(AccessTokenGuard) // old version @UseGuards(AuthGuard('jwt'))
  @Post('signout')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  signout(@GetCurrentUserID() userId: number): Promise<boolean> {
    return this.authService.signout(userId);

    //old
    // const userId = req.user['sub'];
    // return this.authService.signout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard) // old version @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  refresh(
    @GetCurrentUserID() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refresh(userId, refreshToken);

    // old version
    // const userId = req.user['sub'];
    // const refreshToken = req.user['refreshToken'];
    // return this.authService.refresh(userId, refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  forgotPassword(@Body() dto: EmailDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password-reset')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  resetPassword(@Body() dto: PasswordResetDto) {
    return this.authService.passwordReset(dto);
  }

  // testing role base authorization. status working
  @Post('create')
  @Roles('ADMIN') // roles is a custom decorator used to check if user has a role of admin
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: AuthRegisterDto) {
    return 'create user';
  }
}
