import { RefreshTokenGuard } from './../common/guards';
import {
  AuthDto,
  AuthRegisterDto,
  ConfirmResetCodeDto,
  ForgotPasswordDto,
  UpdatePasswordDto,
} from './dto';
import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import {
  GetCurrentUser,
  GetCurrentUserID,
  Public,
  Roles,
} from 'src/common/decorators';
import { Tokens } from './utils/types';
import e from 'express';
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
    console.log(dto);
    console.log('hitted');
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
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('congirm-reset-code')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  confirmResetCode(@Body() dto: ConfirmResetCodeDto) {
    return this.authService.confirmResetCode(dto);
  }

  @Post('update-password')
  @HttpCode(HttpStatus.OK) // by default post request will return 201 Created status code, but we want to return 200 OK status code
  updatePassword(
    @GetCurrentUserID() userId: number,
    @Body() dto: UpdatePasswordDto,
  ) {
    console.log({ dto, userId });
    return this.authService.updatePassword(userId, dto);
  }

  @Get('me')
  async getMe(@GetCurrentUserID() userId: number) {
    return await this.authService.getMe(userId);
  }

  @Get('users')
  @Public()
  getUsers() {
    return this.authService.getUsers();
  }

  @Get('users/:id')
  @Public()
  getUser(@Param('id') id: number) {
    return this.authService.getUserById(id);
  }

  // testing role base authorization. status working
  // @Post('create')
  // @Roles('ADMIN') // roles is a custom decorator used to check if user has a role of admin
  // @HttpCode(HttpStatus.CREATED)
  // createUser(@Body() dto: AuthRegisterDto) {
  //   return 'create user';
  // }
}
