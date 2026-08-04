import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeituraDto {
  @IsDateString()
  dataleitura!: string;

  @IsNumber()
  valorleitura!: number;

  @IsOptional()
  @IsString()
  fotoleitura?: string;
}
