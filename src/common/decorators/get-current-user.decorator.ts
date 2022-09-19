import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // if no data is pass in GetCurrentUser() then data will be undefined

    const request = ctx.switchToHttp().getRequest();
    // ExecutionContext has access to the request object

    // if no data is passed in GetCurrentUser() then return the entire user object
    if (!data) return request.user;

    // if data is passed in GetCurrentUser('sub') then data will be the property name
    return request.user[data];
  },
);
