import { Transform } from "class-transformer";
import { IsBoolean, IsDecimal, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateExtraDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsNumber()
  @Transform(({ value }) => {
    if (!value) return 0;
    return parseFloat(value);
  })
  price: number;

  @IsString()
  @MinLength(1)
  branch: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  available?: boolean;
}
