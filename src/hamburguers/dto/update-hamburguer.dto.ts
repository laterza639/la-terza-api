import { PartialType } from '@nestjs/mapped-types';
import { CreateHamburguerDto } from './create-hamburguer.dto';

export class UpdateHamburguerDto extends PartialType(CreateHamburguerDto) {}
