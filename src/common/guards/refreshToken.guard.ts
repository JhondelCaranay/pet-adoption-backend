import { AuthGuard } from '@nestjs/passport';

export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  // this will trigger validate() method in refreshToken.strategy.ts
  constructor() {
    super();
  }
}
