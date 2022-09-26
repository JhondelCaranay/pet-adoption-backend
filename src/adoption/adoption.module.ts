import { Module } from '@nestjs/common';
import { PetModule } from 'src/pet/pet.module';
import { AdoptionController } from './adoption.controller';
import { AdoptionService } from './adoption.service';

@Module({
  controllers: [AdoptionController],
  providers: [AdoptionService],
  imports: [PetModule],
})
export class AdoptionModule {}
