import { IsDateString, IsNumber } from 'class-validator';

export class CreateLeituraSaneparDto {
  @IsDateString()
  datasanepar!: string;

  @IsNumber()
  valorsanepar!: number;
}
