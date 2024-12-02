import { Module } from '@nestjs/common';
import { HamburguersService } from './hamburguers.service';
import { HamburguersController } from './hamburguers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hamburguer, HamburguerImage } from './entities';

@Module({
  controllers: [HamburguersController],
  providers: [HamburguersService],
  imports: [
    TypeOrmModule.forFeature([ Hamburguer, HamburguerImage ])
  ]
})
export class HamburguersModule {}
