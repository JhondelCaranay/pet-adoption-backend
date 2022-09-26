import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AccessTokenGuard } from './common/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // add api prefix to every route
  app.setGlobalPrefix('api');
  // enable cors
  app.enableCors();

  // add validation pipe to every route
  app.useGlobalPipes(
    // ValidationPipe is used to validate data . For example, if we have a DTO class, then we can use ValidationPipe to validate the data.
    // validation can be used in global scope or in controller scope.

    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // whitelist remove all properties that are not defined in DTO class . For example, if we have a DTO class with a property called name, then if we send a request with a property called age, then the age property will be removed.
    }),
  );

  // const reflector = new Reflector();
  // app.useGlobalGuards(new AccessTokenGuard(reflector));
  // guard for all routes, guard can be use globally, controller level , and route level

  // i just update this to separate a port
  // 3000 is already using by react
  app.setGlobalPrefix('api');
  await app.listen(3001);
}
bootstrap();
