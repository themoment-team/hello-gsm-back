import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ExitDto {
  @ApiProperty({
    title: '비밀번호',
    example: '12345678',
    description: '8글자 ~ 30글자 까지',
  })
  @MinLength(8)
  @MaxLength(30)
  @IsString()
  password: string;
}
