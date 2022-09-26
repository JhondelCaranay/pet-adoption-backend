import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';

@Module({
  imports: [],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
