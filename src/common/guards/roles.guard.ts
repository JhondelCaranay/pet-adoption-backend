import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // match roles
  matchRoles(roles: string[], userRole: string): boolean {
    return roles.includes(userRole);
  }

  canActivate(context: ExecutionContext): boolean {
    // get roles from @Roles decorator
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    // access request object
    const request = context.switchToHttp().getRequest();
    // get user from request object
    const user = request.user;

    // console.log('ROLES GUARD ', { roles, user });

    // match roles given in route and user role
    return this.matchRoles(roles, user.role);
    // if this returns true, then the route will be executed
    // else if this returns false, then the route will not be executed and 403 Forbidden will be returned
  }
}
