import { Module } from '@nestjs/common';
import { DessertsService } from './desserts.service';
import { DessertsController } from './desserts.controller';
import { Dessert, DessertImage } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DessertsController],
  providers: [DessertsService],
  imports: [
    TypeOrmModule.forFeature([Dessert, DessertImage])
  ]
})
export class DessertsModule { }
