import { Module } from '@nestjs/common';
import { DrinksService } from './drinks.service';
import { DrinksController } from './drinks.controller';
import { Drink, DrinkImage } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DrinksController],
  providers: [DrinksService],
  imports: [
    TypeOrmModule.forFeature([Drink, DrinkImage])
  ]
})
export class DrinksModule { }
