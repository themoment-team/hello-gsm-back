import { IsString } from 'class-validator';

export class ExitDto {
  @IsString()
  password: string;
}
