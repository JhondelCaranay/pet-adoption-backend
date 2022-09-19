import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserID = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): number => {
    // ExecutionContext has access to the request object
    const request = ctx.switchToHttp().getRequest();

    // if GetCurrentUser() is called then return user id from request object
    return request.user['sub'];
  },
);
