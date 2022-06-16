import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserState(user_idx: number) {
    return this.prisma.user.findFirst({
      where: { user_idx },
      select: {
        name: true,
        userImg: true,
        application: {
          select: {
            isFinalSubmission: true,
            isDocumentReception: true,
            firstResultScreening: true,
            finalResultScreening: true,
            registrationNumber: true,
          },
        },
      },
    });
  }

  async updateUser(user_idx: number, data: UserDto) {
    if (!/^0\d{2}\d{3,4}\d{4}/g.test(data.cellphoneNumber))
      throw new BadRequestException('잘못된 전화번호 입력 방식입니다');
    if (new Date(data.birth).toString() === 'Invalid Date')
      throw new BadRequestException('잘못된 날짜 형식입니다');

    await this.prisma.user.update({
      where: { user_idx },
      data: {
        ...data,
        cellphoneNumber: data.cellphoneNumber.replace(/[- /]/g, ''),
        birth: new Date(data.birth),
      },
    });
    return '정보 수정에 성공했습니다';
  }

  async getUserInfo(user_idx: number) {
    return this.prisma.user.findFirst({
      where: { user_idx },
      select: {
        name: true,
        birth: true,
        gender: true,
        cellphoneNumber: true,
      },
    });
  }
}
