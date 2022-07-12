import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { GetAllApplicationQuery, ScoreDto } from './dto';

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

  /*
   * 2차 시험을 치른 후 점수를 입력하는 기능
   * @param {ScoreDto} data
   * @return {Promise<string>}
   */
  async score(data: ScoreDto): Promise<string> {
    const application = await this.prisma.application.findFirst({
      where: { registrationNumber: data.registrationNumber },
    });

    if (!application) throw new BadRequestException('유저를 찾을 수 없습니다');
    if (new Date() >= new Date('20221109'))
      throw new BadRequestException('수정할 수 있는 기간이 지났습니다');

    await this.prisma.application.update({
      where: { registrationNumber: data.registrationNumber },
      data: {
        application_score: {
          update: {
            personalityEvaluationScore: data.personalityEvaluationScore,
          },
        },
      },
    });

    return '수정에 성공했습니다';
  }
}
