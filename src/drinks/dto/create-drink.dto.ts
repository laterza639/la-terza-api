import { IsDecimal, IsOptional, IsString, MinLength } from "class-validator";

export class CreateDrinkDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  size: string;

  @IsDecimal()
  price: number;

  @IsString()
  @IsOptional()
  img?: string;
}
