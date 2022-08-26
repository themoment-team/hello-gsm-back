import { IsNumber } from 'class-validator';

export class GedSubmissionDto {
  @IsNumber()
  curriculumScoreSubtotal: number;

  @IsNumber()
  nonCurriculumScoreSubtotal: number;

  @IsNumber()
  rankPercentage: number;

  @IsNumber()
  scoreTotal: number;
}
