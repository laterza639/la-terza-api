import { Module } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { SnacksController } from './snacks.controller';
import { Snack, SnackImage } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [SnacksController],
  providers: [SnacksService],
  imports: [
    TypeOrmModule.forFeature([Snack, SnackImage])
  ]
})
export class SnacksModule { }
