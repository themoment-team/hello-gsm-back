import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
          },
        },
      },
    });
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
