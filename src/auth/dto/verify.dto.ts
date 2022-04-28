import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class verifyDto {
  @ApiProperty({ title: '이메일', example: 'example@example.com' })
  @IsEmail()
  @IsString()
  email: string;
}
