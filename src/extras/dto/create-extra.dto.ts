import { IsDecimal, IsString, MinLength } from "class-validator";

export class CreateExtraDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsDecimal()
  price: number;
}
