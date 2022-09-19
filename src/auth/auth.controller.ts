import { RefreshTokenGuard } from './../common/guards/refreshToken.guard';
import { AccessTokenGuard } from './../common/guards/accessToken.guard';
import { AuthRegisterDto } from './dto/auth.dto';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Tokens } from './types';
// import { Request } from 'express';
import {
  GetCurrentUser,
  GetCurrentUserID,
  Public,
} from 'src/common/decorators';
// import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup') // register
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthRegisterDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('signin') // login
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  // @UseGuards(AccessTokenGuard) // old @UseGuards(AuthGuard('jwt'))
  @Post('signout') // logout
  @HttpCode(HttpStatus.OK)
  signout(@GetCurrentUserID() userId: number): Promise<boolean> {
    return this.authService.signout(userId);

    //old
    // const userId = req.user['sub'];
    // return this.authService.signout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard) // old @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh') // refresh token
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetCurrentUserID() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refresh(userId, refreshToken);

    // old
    // const userId = req.user['sub'];
    // const refreshToken = req.user['refreshToken'];
    // return this.authService.refresh(userId, refreshToken);
  }
}
