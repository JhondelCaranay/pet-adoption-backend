import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AccessTokenGuard } from './common/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  // const reflector = new Reflector();
  // app.useGlobalGuards(new AccessTokenGuard(reflector)); // guard for all routes, guard can be use globally, controller level , and route level
  await app.listen(3000);
}
bootstrap();
