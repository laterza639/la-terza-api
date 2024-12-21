import { IsString, IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:MM',
  })
  morningOpenTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  morningCloseTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  eveningOpenTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  eveningCloseTime?: string;

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  @IsString()
  branch: string;
}
