import { Transform } from "class-transformer";
import { IsBoolean, IsDecimal, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateHamburguerDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsDecimal()
  @Transform(({ value }) => {
    if (!value) return '0';
    return value.toString();
  })
  price: number;

  @IsString()
  @MinLength(3)
  ingredients: string;

  @IsString()
  @MinLength(1)
  branch: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    const stringValue = String(value).toLowerCase();
    return stringValue !== 'false';
  })
  available?: boolean;

  @IsString()
  @IsOptional()
  img?: string;
}
