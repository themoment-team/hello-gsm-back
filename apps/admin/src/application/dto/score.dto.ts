import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  registrationNumber: number;

  @IsNumber()
  @IsNotEmpty()
  @Max(140)
  @Min(0)
  personalityEvaluationScore: number;
}
