import { Module } from '@nestjs/common';
import { ExtrasService } from './extras.service';
import { ExtrasController } from './extras.controller';
import { Extra } from './entities/extra.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ExtrasController],
  providers: [ExtrasService],
  imports: [
    TypeOrmModule.forFeature([Extra])
  ]
})
export class ExtrasModule { }
