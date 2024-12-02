import { PartialType } from '@nestjs/mapped-types';
import { CreateDessertDto } from './create-dessert.dto';

export class UpdateDessertDto extends PartialType(CreateDessertDto) {}
