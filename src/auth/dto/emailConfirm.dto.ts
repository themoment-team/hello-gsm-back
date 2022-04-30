import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class emailConfirmDto {
  @ApiProperty({ title: '이메일', example: 'example@example.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    title: '인증 코드',
    description: '영어 대소문자 + 숫자 6글자',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}
