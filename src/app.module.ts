import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard, RolesGuard } from './common/guards';
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard, // athentication guard for all routes

      // this will make AccessTokenGuard run for all routes without the need to add @UseGuards(AccessTokenGuard) in each route
      // this will make all routes require authentication, unless we add @Public() decorator in the route
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // role guard for all routes
    },
  ],
})
export class AppModule {}
