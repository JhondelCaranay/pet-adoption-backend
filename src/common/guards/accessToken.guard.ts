import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  // this will trigger validate() method in accessToken.strategy.ts

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // get boolean from @Public decorator
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    // console.log('AccessTokenGuard ', { isPublic });

    // if isPublic is true, then skip authentication
    if (isPublic) {
      return true;
    }

    // if isPublic is false, then run authentication
    return super.canActivate(context);

    // old version
    // const isPublic = this.reflector.getAllAndOverride('isPublic', [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);

    // if (isPublic) return true;

    // return super.canActivate(context);
  }
}
