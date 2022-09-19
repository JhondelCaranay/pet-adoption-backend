import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserID = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    // ExecutionContext has access to the request object

    // if GetCurrentUser() is called then return user id
    return request.user['sub'];
  },
);
