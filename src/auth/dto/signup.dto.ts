import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ title: '이메일', example: 'example@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    title: '실명',
    example: '홍길동',
    description: '티모 Q',
  })
  @IsString()
  name: string;

  @ApiProperty({ title: '성별', description: 'M 또는 W', example: 'M' })
  @IsIn(['M', 'W'])
  gender: 'M' | 'W';

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
