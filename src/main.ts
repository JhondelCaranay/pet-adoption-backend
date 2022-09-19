import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AccessTokenGuard } from './common/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    // ValidationPipe is used to validate data . For example, if we have a DTO class, then we can use ValidationPipe to validate the data.
    // validation can be used in global scope or in controller scope.

    new ValidationPipe({
      whitelist: true,
      // whitelist remove all properties that are not defined in DTO class . For example, if we have a DTO class with a property called name, then if we send a request with a property called age, then the age property will be removed.
    }),
  );

  // const reflector = new Reflector();
  // app.useGlobalGuards(new AccessTokenGuard(reflector));
  // guard for all routes, guard can be use globally, controller level , and route level
  await app.listen(3000);
}
bootstrap();
