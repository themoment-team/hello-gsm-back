import { IsNotEmpty, IsNumber } from 'class-validator';

export class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  registrationNumber: number;

  @IsNumber()
  @IsNotEmpty()
  personalityEvaluationScore: number;
}
