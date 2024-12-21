import { Transform } from "class-transformer";
import { IsBoolean, IsDecimal, IsOptional, IsString, MinLength } from "class-validator";

export class CreateDessertDto {
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
