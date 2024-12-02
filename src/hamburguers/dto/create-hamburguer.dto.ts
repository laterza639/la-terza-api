import { IsDecimal, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateHamburguerDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsDecimal()
  price: number;

  @IsString()
  @MinLength(3)
  ingredients: string;

  @IsString()
  @IsOptional()
  img?: string;
}
