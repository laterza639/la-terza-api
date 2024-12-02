import { IsDecimal, IsOptional, IsString, MinLength } from "class-validator";

export class CreateSnackDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsDecimal()
  price: number;

  @IsString()
  @IsOptional()
  img?: string;
}
