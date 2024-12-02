import { IsDecimal, IsOptional, IsString, MinLength } from "class-validator";

export class CreateDessertDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsDecimal()
  price: number;

  @IsString()
  @IsOptional()
  img?: string;
}
