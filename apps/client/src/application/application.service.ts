import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'apps/client/src/lib/env';
import { PrismaService } from 'apps/client/src/prisma/prisma.service';
import {
  ApplicationDetailDto,
  ApplicationDto,
  FirstSubmissionDto,
  SecondSubmissionDto,
  QualificationFirstDto,
  ApplicationGraduationDto,
  ApplicationDetailGraduationDto,
  ApplicationDetailQualificationDto,
  GraduationSubmissionDto,
} from './dto';
import { v1 } from 'uuid';
import * as AWS from 'aws-sdk';
import { EducationStatus } from 'apps/client/src/types';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  s3 = new AWS.S3({
    accessKeyId: this.configService.get<string>(ENV.AWS_ACCESS_KEY_ID),
    secretAccessKey: this.configService.get<string>(ENV.AWS_SECRET_ACCESS_KEY),
  });

  /**
   * 유저 원서 정보 모두 가져오기
   * @param {number} user_idx
   */
  async getAllUserInfo(user_idx: number) {
    const user = await this.prisma.user.findFirst({
      where: { user_idx: user_idx },
      include: {
        application_image: { select: { idPhotoUrl: true } },

        application: {
          include: { application_score: true, application_details: true },
        },
      },
    });

    return JSON.parse(
      JSON.stringify(user, (_, value) => {
        if (typeof value === 'bigint') return Number(value);
        else if (value === 'null') return null;
        return value;
      }),
    );
  }

  /**
   * 1차 서류 제출
   * @param {number} user_idx
   * @param {FirstSubmissionDto} data
   * @returns {Promise<string>} 1차 서류 저장에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async firstSubmission(
    user_idx: number,
    data: FirstSubmissionDto,
  ): Promise<string> {
    this.checkApplicationDate();

    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: { application: true },
    });

    if (user.application)
      throw new BadRequestException('이미 작성된 원서가 있습니다.');

    this.checkMajor(data.applicationDetail);

    await this.prisma.application.create({
      data: {
        ...this.checkApplication(
          data.application,
          data.applicationDetail.educationStatus,
        ),
        user: { connect: { user_idx } },
        application_details: {
          create: {
            ...this.checkApplicationDetail(data.applicationDetail),
          },
        },
      },
    });

    return '1차 서류 저장에 성공했습니다';
  }

  /**
   * 이미지 업로드
   * @param {Express.Multer.File} photo
   * @returns {Promise<string>} 이미지 url
   * @throws {BadRequestException} BadRequestException
   */
  async image(photo: Express.Multer.File, user_idx: number): Promise<string> {
    this.checkApplicationDate();

    if (!photo || !photo.mimetype.includes('image'))
      throw new BadRequestException('Not Found photo');
    if (photo.size > 500000)
      throw new BadRequestException('파일 크기는 최대 500KB입니다');

    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: { application_image: true, application: true },
    });

    if (user.application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 서류는 수정할 수 없습니다');

    if (user.application_image)
      this.deleteImg(user.application_image.idPhotoUrl);

    const params = {
      Bucket: this.configService.get(ENV.AWS_S3_BUCKET_NAME),
      Key: v1(),
      Body: photo.buffer,
      ACL: 'public-read',
      ContentType: photo.mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: this.configService.get(ENV.AWS_REGION),
      },
    };

    this.s3Upload(params, user_idx, user, 0);

    return '이미지 업로드에 성공했습니다';
  }

  async s3Upload(
    params: AWS.S3.PutObjectRequest,
    user_idx: number,
    user: any,
    cnt: number,
  ) {
    try {
      const result = await this.s3.upload(params).promise();

      if (!user.application_image)
        await this.prisma.application_image.create({
          data: {
            user: { connect: { user_idx } },
            idPhotoUrl: result.Location,
          },
        });
      else
        await this.prisma.application_image.update({
          where: { user_idx },
          data: { idPhotoUrl: result.Location },
        });
    } catch (e) {
      if (cnt > 2) return;
      this.s3Upload(params, user_idx, user, cnt++);
    }
  }

  /**
   * 원서 삭제
   * @param {number} user_idx
   * @returns {Promise<string>} 원서 제거에 성공했습니다
   */
  async deleteApplication(user_idx: number): Promise<string> {
    this.checkApplicationDate();

    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: {
        application: { include: { application_details: true } },
        application_image: true,
      },
    });

    if (!user.application)
      throw new BadRequestException('저장된 원서가 없습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 서류는 삭제할 수 없습니다');

    if (user.application_image)
      this.deleteImg(user.application_image.idPhotoUrl);

    await this.prisma.application.delete({
      where: { applicationIdx: user.application.applicationIdx },
      include: {
        application_score: true,
        application_details: true,
      },
    });

    await this.prisma.application_image.delete({
      where: { user_idx },
    });

    return '원서 제거에 성공했습니다';
  }

  /**
   * 2차 서류 제출
   * @param {SecondSubmissionDto} data
   * @param {number} user_idx
   * @returns {Promise<string>} 2차 서류 작성에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async secondSubmission(
    data: SecondSubmissionDto,
    user_idx: number,
  ): Promise<string> {
    this.checkApplicationDate();

    const user = await this.getUserApplication(user_idx);

    if (user.application.application_score)
      throw new BadRequestException('이미 작성된 원서가 있습니다');

    this.calcScore(data);

    await this.prisma.application_score.create({
      data: {
        ...data,
        score1_2: -1,
        score1_1: -1,
        score3_2: -1,
        rankPercentage: this.calcRankPercentage(data.scoreTotal),

        application: {
          connect: { applicationIdx: user.application.applicationIdx },
        },
      },
    });

    return '2차 서류 작성에 성공했습니다';
  }

  /*
   * 졸업자 전용 성적 입력
   * @param {GrduationSubmissionDto} data
   * @param {number} user_idx
   * @return {Promise<string>}
   */
  async graduationSubmission(data: GraduationSubmissionDto, user_idx: number) {
    this.checkApplicationDate();

    const user = await this.getUserApplication(user_idx);

    if (
      user.application.application_details.educationStatus !==
      EducationStatus.졸업
    )
      throw new BadRequestException('잘못된 요청입니다');
    if (user.application.application_score)
      throw new BadRequestException('이미 작성된 원서가 있습니다');

    this.graduationScoreCalc(data);
    if (data.rankPercentag !== this.calcRankPercentage(data.scoreTotal))
      throw new BadRequestException('계산 결과가 올바르지 않습니다');

    await this.prisma.application_score.create({
      data: {
        ...data,
        score1_1: data.score1_1 < 0 ? -1 : data.score1_1,
        score1_2: data.score1_2 < 0 ? -1 : data.score1_2,
        score2_1: data.score2_1 < 0 ? -1 : data.score2_1,
        applicationIdx: user.application.applicationIdx,
      },
    });

    return '저장에 성공했습니다';
  }

  /**
   * 1차 서류 제출 수정
   * @param {number} user_idx
   * @param {FirstSubmissionDto} data
   * @returns {Promise<string>} 수정에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async firstSubmissionPatch(
    user_idx: number,
    data: FirstSubmissionDto,
  ): Promise<string> {
    this.checkApplicationDate();

    const application = await this.prisma.application.findFirst({
      where: { user_idx },
      include: { application_details: true },
    });

    if (!application || !application.application_details)
      throw new BadRequestException('작성된 원서가 없습니다');
    if (application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 원서는 수정할 수 없습니다');

    this.checkMajor(data.applicationDetail);

    await this.prisma.user.update({
      where: { user_idx },
      data: {
        application: {
          update: {
            ...this.checkApplication(
              data.application,
              data.applicationDetail.educationStatus,
            ),
            application_details: {
              update: {
                ...this.checkApplicationDetail(data.applicationDetail),
              },
            },
          },
        },
      },
    });

    return '수정에 성공했습니다';
  }

  /**
   * 2차 서류 제출 수정
   * @param {SecondSubmissionDto} data
   * @param {number} user_idx
   * @returns {Promise<sting>} 저장에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async secondSubmissionPatch(
    data: SecondSubmissionDto,
    user_idx: number,
  ): Promise<string> {
    this.checkApplicationDate();

    const user = await this.getUserApplication(user_idx);

    if (!user.application.application_score)
      throw new BadRequestException('작성된 원서가 없습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 원서는 수정할 수 없습니다');

    this.calcScore(data);

    await this.prisma.application_score.update({
      where: { applicationIdx: user.application.applicationIdx },
      data: {
        ...data,
      },
    });

    return '저장에 성공했습니다';
  }

  /**
   * 서류 최종 제출
   * @param {number} user_idx
   * @returns {Promise<string>} 최종 제출에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async finalSubmission(user_idx: number): Promise<number> {
    this.checkApplicationDate();

    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: {
        application: {
          include: { application_score: true, application_details: true },
        },
        application_image: true,
      },
    });

    if (
      !user.application ||
      !user.application.application_details ||
      !user.application.application_score ||
      !user.application_image
    )
      throw new BadRequestException('서류가 완전히 작성되지 않았습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('이미 최종 제출이 되어있습니다');

    await this.prisma.$transaction([
      this.prisma
        .$executeRaw`CALL usp_set_registration_number(${user.application.applicationIdx})`,
      this.prisma.application.update({
        where: { user_idx },
        data: { isFinalSubmission: true },
      }),
    ]);

    return user.application.applicationIdx;
  }

  /**
   * 증명사진 삭제
   * @param {string} imgUrl
   * @throws {ServiceUnavailableException} ServiceUnavailableException
   */
  private async deleteImg(imgUrl: string) {
    for (let i = 0; i < 3; i++) {
      try {
        await this.s3
          .deleteObject({
            Bucket: this.configService.get(ENV.AWS_S3_BUCKET_NAME),
            Key: imgUrl.replace(this.configService.get(ENV.AWS_S3_URL), ''),
          })
          .promise();

        return;
      } catch (e) {}
    }
  }

  /**
   * 전공 겹침 체크
   * @param {ApplicationDetailDto} data
   * @throws {BadRequestException} BadRequestException
   */
  private checkMajor(data: ApplicationDetailDto) {
    if (
      data.firstWantedMajor === data.secondWantedMajor ||
      data.firstWantedMajor === data.thirdWantedMajor ||
      data.secondWantedMajor === data.thirdWantedMajor
    )
      throw new BadRequestException(
        '각 지망학과는 각각 다르게 지원해야 합니다.',
      );
  }

  /**
   * 원서 검사 및 필터링
   * @param {ApplicationDto} data
   * @param {EducationStatus}educationStatus
   * @returns {ApplicationGraduationDto | QualificationFirstDto}
   * @throws {BadRequestException} BadRequestException
   */
  private checkApplication(
    data: ApplicationDto,
    educationStatus: EducationStatus,
  ): ApplicationGraduationDto | QualificationFirstDto {
    if (educationStatus === EducationStatus.검정고시) {
      const application: QualificationFirstDto = {
        ...data,
        guardianCellphoneNumber: this.checkPhoneNumber(
          data.guardianCellphoneNumber,
        ),
        schoolName: 'null',
        teacherCellphoneNumber: 'null',
      };
      return application;
    }

    const application: ApplicationGraduationDto = {
      screening: data.screening,
      schoolName: data.schoolName,
      teacherCellphoneNumber: this.checkPhoneNumber(
        data.teacherCellphoneNumber,
      ),
      guardianCellphoneNumber: this.checkPhoneNumber(
        data.guardianCellphoneNumber,
      ),
    };

    return application;
  }

  /**
   * applicationDetail 테이블에 들어갈 데이터 필터링 및 검사
   * @param {ApplicationDetailDto} data
   * @returns {ApplicationDetailGraduationDto | ApplicationDetailQualificationDto}
   */
  private checkApplicationDetail(
    data: ApplicationDetailDto,
  ): ApplicationDetailGraduationDto | ApplicationDetailQualificationDto {
    if (data.educationStatus === EducationStatus.검정고시) {
      const application: ApplicationDetailQualificationDto = {
        ...data,
        addressDetails: data.addressDetails || 'null',
        telephoneNumber: this.checkPhoneNumber(data.telephoneNumber),
        teacherName: 'null',
        schoolLocation: 'null',
        educationStatus: EducationStatus.검정고시,
      };
      return application;
    }

    const application: ApplicationDetailGraduationDto = {
      ...data,
      addressDetails: data.addressDetails || 'null',
      telephoneNumber: this.checkPhoneNumber(data.telephoneNumber),
      educationStatus:
        data.educationStatus === EducationStatus.졸업
          ? EducationStatus.졸업
          : EducationStatus.졸업예정,
    };

    return application;
  }

  /**
   * 성적 계산 체크
   * @param { SecondSubmissionDto } data
   * @throws { BadRequestException } BadRequestException
   */
  private calcScore(data: SecondSubmissionDto) {
    const total = data.score2_2 + data.score2_1 + data.score3_1;
    if (
      total !== data.generalCurriculumScoreSubtotal ||
      data.artSportsScore + data.generalCurriculumScoreSubtotal !==
        data.curriculumScoreSubtotal ||
      data.nonCurriculumScoreSubtotal !==
        data.attendanceScore + data.volunteerScore ||
      data.curriculumScoreSubtotal + data.nonCurriculumScoreSubtotal !==
        data.scoreTotal
    )
      throw new BadRequestException('계산 결과가 올바르지 않습니다');
  }

  /**
   * 전화번호 검사
   * @param {string} cellphoneNumber
   * @returns {string} 01012341234
   * @throws {BadRequestException} BadRequestException
   */
  private checkPhoneNumber(cellphoneNumber: string): string {
    if (!cellphoneNumber) return 'null';
    if (!/^0\d{2}\d{3,4}\d{4}/g.test(cellphoneNumber))
      throw new BadRequestException('잘못된 전화번호 입력 방식입니다');
    return cellphoneNumber;
  }

  /**
   * Application 조회
   * @param {number} user_idx
   * @throws {BadRequestException} BadRequestException
   */
  private async getUserApplication(user_idx: number) {
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: {
        application: {
          include: { application_details: true, application_score: true },
        },
      },
    });

    if (!user.application)
      throw new BadRequestException('1차 서류가 작성되지 않았습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 서류는 수정할 수 없습니다');

    return user;
  }

  private checkApplicationDate() {
    if (new Date() >= new Date('2022-10-21'))
      throw new BadRequestException('서류를 작성할 수 있는 기간이 지났습니다');
  }

  private calcRankPercentage(scoreTotal: number) {
    return Number(((1 - scoreTotal / 300) * 100).toFixed(4));
  }

  private graduationScoreCalc(data: GraduationSubmissionDto) {
    const total =
      data.score1_1 +
      data.score1_2 +
      data.score2_2 +
      data.score2_1 +
      data.score3_1 +
      data.score3_2;

    if (
      total !== data.generalCurriculumScoreSubtotal ||
      data.artSportsScore + data.generalCurriculumScoreSubtotal !==
        data.curriculumScoreSubtotal ||
      data.nonCurriculumScoreSubtotal !==
        data.attendanceScore + data.volunteerScore ||
      data.curriculumScoreSubtotal + data.nonCurriculumScoreSubtotal !==
        data.scoreTotal
    )
      throw new BadRequestException('계산 결과가 올바르지 않습니다');
  }
}
