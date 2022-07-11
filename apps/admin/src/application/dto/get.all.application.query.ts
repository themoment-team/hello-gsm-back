import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GetAllApplicationQuery {
  @IsString()
  @IsNotEmpty()
  page: string;

  @IsString()
  @IsOptional()
  name: string;
}
