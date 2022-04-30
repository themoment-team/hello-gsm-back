import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ModifyPwdDto {
  @ApiProperty({ title: '이메일', example: 'example@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    title: '인증 코드',
    description: '영어 대소문자 + 숫자 6글자',
  })
  @IsString()
  code: string;

  @ApiProperty({
    title: '비밀번호',
    example: '12345678',
    description: '8글자 ~ 30글자 까지',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  password: string;

  @ApiProperty({
    title: '비밀번호 확인',
    example: '12345678',
    description: '8글자 ~ 30글자 까지',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  passwordConfirm: string;
}
