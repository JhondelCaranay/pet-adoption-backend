import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // module is available to all other modules
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
