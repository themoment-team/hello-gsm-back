import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { GetAllApplicationQuery } from './dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async GetAllApplication(query: GetAllApplicationQuery) {
    if (!parseInt(query.page))
      throw new BadRequestException('잘못된 입력입니다');

    return this.prisma.user.findMany({
      select: {
        cellphoneNumber: true,
        application: {
          select: {
            applicationIdx: true,
            screening: true,
            schoolName: true,
            isDocumentReception: true,
            guardianCellphoneNumber: true,
            teacherCellphoneNumber: true,
            firstResultScreening: true,
            finalResultScreening: true,
          },
        },
      },

      skip: 10 * parseInt(query.page) - 10,
      take: 10,

      where: {
        application: {
          AND: [
            { NOT: undefined },
            { user: { name: { contains: query.name } } },
          ],
        },
      },
    });
  }
}
