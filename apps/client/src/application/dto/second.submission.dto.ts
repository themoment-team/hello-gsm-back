import { IsNumber, Max, Min } from 'class-validator';

export class SecondSubmissionDto {
  @Min(10.8)
  @Max(54)
  @IsNumber()
  score2_1: number;

  @Min(10.8)
  @Max(54)
  @IsNumber()
  score2_2: number;

  @Min(14.4)
  @Max(72)
  @IsNumber()
  score3_1: number;

  @Max(180)
  @Min(36)
  @IsNumber()
  generalCurriculumScoreSubtotal: number;

  @Max(60)
  @Min(36)
  @IsNumber()
  artSportsScore: number;

  @Max(30)
  @Min(0)
  @IsNumber()
  attendanceScore: number;

  @Max(240)
  @Min(72)
  @IsNumber()
  curriculumScoreSubtotal: number;

  @Max(30)
  @Min(6)
  @IsNumber()
  volunteerScore: number;

  @Max(60)
  @Min(6)
  @IsNumber()
  nonCurriculumScoreSubtotal: number;

  @Max(300)
  @Min(78)
  @IsNumber()
  scoreTotal: number;

  @IsNumber()
  rankPercentage: number;
}
