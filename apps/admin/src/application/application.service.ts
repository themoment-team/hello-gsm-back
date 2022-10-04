import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/admin/src/prisma/prisma.service';
import { GetAllApplicationQuery, ScoreDto, DocumentDto } from './dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  /*
   * 최종 제출을 한 지원자들만 검색합니다
   * @param {GetAllApplicationQuery} query
   */
  async GetAllApplication(query: GetAllApplicationQuery) {
    if (!parseInt(query.page) || parseInt(query.page) < 0)
      throw new BadRequestException('잘못된 입력입니다');

    return this.prisma.user.findMany({
      select: {
        name: true,
        cellphoneNumber: true,
        application: {
          select: {
            applicationIdx: true,
            registrationNumber: true,
            screening: true,
            schoolName: true,
            isDocumentReception: true,
            guardianCellphoneNumber: true,
            teacherCellphoneNumber: true,
            firstResultScreening: true,
            finalResultScreening: true,
            application_score: {
              select: {
                personalityEvaluationScore: true,
              },
            },
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
            { isFinalSubmission: { equals: true } },
          ],
        },
      },
      orderBy: [
        { application: { is_pass_final_screening: 'desc' } },
        { application: { is_pass_first_screening: 'desc' } },
        { application: { applicationIdx: 'asc' } },
      ],
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
    if (!application.firstResultScreening)
      throw new BadRequestException('1차에 합격하지 않았습니다');

    // 배포 기간 : 2022-10-28 ~ 2022-11-01
    // 테스트 기간 :  2022-09-21 ~ 2022-10-03
    if (
      !(
        new Date() > new Date('2022-10-28 09:00') &&
        new Date() < new Date('2022-11-01 22:00')
      ) &&
      !(
        new Date() >= new Date('2022-09-21:00:00') &&
        new Date() < new Date('2022-10-03 24:00')
      )
    )
      throw new BadRequestException('수정할 수 있는 기간이 아닙니다');

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

  /*
   * 수험표를 만들기 위해 들어갈 값들을 return 합니다
   */
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
    if (new Date() >= new Date('2022-10-21'))
      throw new BadRequestException('기능을 사용할 수 있는 기간이 지났습니다');

    await this.prisma.application.update({
      where: { registrationNumber },
      data: { isDocumentReception: !application.isDocumentReception },
    });

    return '수정에 성공했습니다';
  }
}
