import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  @Max(100)
  @Min(0)
  registrationNumber: number;

  @IsNumber()
  @IsNotEmpty()
  personalityEvaluationScore: number;
}
