import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { DocumentDto, GetAllApplicationQuery } from './dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  /*
   * 최종 제출을 한 지원자들만 검색합니다
   * @param {GetAllApplicationQuery} query
   */
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
          isFinalSubmission: { equals: true },
        },
      },
    });
  }

  async ticket() {
    return this.prisma.user.findMany({
      select: {
        name: true,
        birth: true,
        application: {
          select: {
            schoolName: true,
            screening: true,
            registrationNumber: true,
          },
        },
        application_image: { select: { idPhotoUrl: true } },
      },
      where: {
        application: {
          firstResultScreening: { not: null },
        },
      },
    });
  }

  /*
   * 지원자가 서류 제출을 완료하면 체크를 해줍니다
   * @param {DocumentDto} data
   * @throw {BadRequestException}
   * @return {Promise<string>}
   */
  async document({ registrationNumber }: DocumentDto): Promise<string> {
    const application = await this.prisma.application.findFirst({
      where: { registrationNumber },
    });

    if (!application) throw new BadRequestException('유저를 찾을 수 없습니다');
    // TODO 1차 시험 보기 전까지만 기능을 사용할 수 있도록 해야함
    if (new Date() >= new Date('20221021'))
      throw new BadRequestException('기능을 사용할 수 있는 기간이 지났습니다');

    await this.prisma.application.update({
      where: { registrationNumber },
      data: { isDocumentReception: !application.isDocumentReception },
    });

    return '수정에 성공했습니다';
  }
}
