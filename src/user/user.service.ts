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
        user_img: true,
        application: {
          select: {
            is_final_submission: true,
            is_document_reception: true,
            first_result_screening: true,
            final_result_screening: true,
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
        cellphone_number: true,
      },
    });
  }
}
