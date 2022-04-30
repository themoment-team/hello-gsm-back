import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SigninDto {
  @ApiProperty({ title: '이메일', example: 'example@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    title: '비밀번호',
    example: '12345678',
    description: '8글자 ~ 30글자 까지',
  })
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  password: string;
}
