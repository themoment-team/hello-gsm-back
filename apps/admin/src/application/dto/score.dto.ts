import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ScoreDto {
  @IsNumber()
  @IsNotEmpty()
  registrationNumber: number;

  @IsNumber()
  @IsNotEmpty()
  @Max(100)
  @Min(1)
  personalityEvaluationScore: number;
}
