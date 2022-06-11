import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/lib/env';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApplicationDetailDto,
  ApplicationDto,
  FirstSubmissionDto,
  SecondsSubmissionDto,
} from './dto';
import { v1 } from 'uuid';
import * as AWS from 'aws-sdk';
import { EducationStatus } from 'src/types';

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
   * 유저 정보 모두 가져오기
   * @param {number} user_idx
   */
  async getAllUserInfo(user_idx: number) {
    const user = await this.prisma.user.findFirst({
      where: { user_idx: user_idx },
      include: {
        application: {
          include: { application_score: true, application_details: true },
        },
      },
    });

    return JSON.stringify(user);
  }

  /**
   * 1차 서류 제출
   * @param {number} user_idx
   * @param {FirstSubmissionDto} data
   * @param {Express.Multer.File} photo
   * @returns {Promise<string>} 1차 서류 저장에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async firstSubmission(
    user_idx: number,
    data: FirstSubmissionDto,
    photo: Express.Multer.File,
  ): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: { application: true },
    });

    if (user.application)
      throw new BadRequestException('이미 작성된 원서가 있습니다.');

    this.checkMajor(data);

    const idPhotoUrl = await this.s3Upload(photo);

    await this.prisma.application.create({
      data: {
        ...this.checkApplication(data),
        user: { connect: { user_idx } },
        application_details: {
          create: {
            ...this.checkApplicationDetail(data, idPhotoUrl),
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
  async s3Upload(photo: Express.Multer.File): Promise<string> {
    if (!photo || !photo.mimetype.includes('image'))
      throw new BadRequestException('Not Found photo');

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

    try {
      const result = await this.s3.upload(params).promise();
      Logger.log(`${result.Key} success upload`);

      return result.Location;
    } catch (e) {
      Logger.error(`${photo.originalname} failed upload`, e);
      throw new BadRequestException('업로드에 실패했습니다.');
    }
  }

  /**
   * 원서 삭제
   * @param {number} user_idx
   * @returns {Promise<string>} 원서 제거에 성공했습니다
   */
  async deleteApplication(user_idx: number): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: { application: { include: { application_details: true } } },
    });

    if (!user.application)
      throw new BadRequestException('저장된 원서가 없습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 서류는 삭제할 수 없습니다');

    await this.prisma.application.delete({
      where: { applicationIdx: user.application.applicationIdx },
      include: {
        application_score: true,
        application_details: true,
      },
    });

    return '원서 제거에 성공했습니다';
  }

  /**
   * 2차 서류 제출
   * @param {SecondsSubmissionDto} data
   * @param {number} user_idx
   * @returns {Promise<string>} 2차 서류 작성에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async secondsSubmission(
    data: SecondsSubmissionDto,
    user_idx: number,
  ): Promise<string> {
    const user = await this.getUserApplication(user_idx);

    if (user.application.application_score)
      throw new BadRequestException('이미 작성된 원서가 있습니다');

    this.calcScore(data);

    await this.prisma.application_score.create({
      data: {
        ...data,
        score1_1: 0,
        score1_2: 0,
        application: {
          connect: { applicationIdx: user.application.applicationIdx },
        },
      },
    });

    return '2차 서류 작성에 성공했습니다';
  }

  /**
   * @param {number} user_idx
   * @param {FirstSubmissionDto} data
   * @param {Express.Multer.File} photo
   * @returns {Promise<string>} 수정에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async firstSubmissionPatch(
    user_idx: number,
    data: FirstSubmissionDto,
    photo: Express.Multer.File,
  ): Promise<string> {
    const application = await this.prisma.application.findFirst({
      where: { user_idx },
      include: { application_details: true },
    });

    if (!application || !application.application_details)
      throw new BadRequestException('작성된 원서가 없습니다');
    if (application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 원서는 수정할 수 없습니다');

    this.checkMajor(data);

    this.deleteImg(application.application_details.idPhotoUrl);

    const idPhotoUrl = await this.s3Upload(photo);

    await this.prisma.user.update({
      where: { user_idx },
      data: {
        application: {
          update: {
            ...this.checkApplication(data),
            application_details: {
              update: {
                ...this.checkApplicationDetail(data, idPhotoUrl),
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
   * @param {SecondsSubmissionDto} data
   * @param {number} user_idx
   * @returns {Promise<sting>} 저장에 성공했습니다
   * @throws {BadRequestException} BadRequestException
   */
  async secondsSubmissionPatch(
    data: SecondsSubmissionDto,
    user_idx: number,
  ): Promise<string> {
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
        score1_1: 0,
        score1_2: 0,
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
  async finalSubmission(user_idx: number): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      include: {
        application: {
          include: { application_score: true, application_details: true },
        },
      },
    });

    if (
      !user.application ||
      !user.application.application_details ||
      !user.application.application_score
    )
      throw new BadRequestException('서류가 완전히 작성되지 않았습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('이미 최종 제출이 되어있습니다');

    await this.prisma.application.update({
      where: { user_idx },
      data: { isFinalSubmission: true },
    });

    return '최종 제출에 성공했습니다';
  }

  /**
   * 증명사진 삭제
   * @param {string} imgUrl
   * @throws {ServiceUnavailableException} ServiceUnavailableException
   */
  private async deleteImg(imgUrl: string) {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.configService.get(ENV.AWS_S3_BUCKET_NAME),
          Key: imgUrl.replace(this.configService.get(ENV.AWS_S3_URL), ''),
        })
        .promise();
    } catch (e) {
      throw new ServiceUnavailableException('원서 수정을 할 수 없습니다.');
    }
  }

  /**
   * @param {FirstSubmissionDto} data
   * @throws {BadRequestException} BadRequestException
   */
  private checkMajor(data: FirstSubmissionDto) {
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
   * @param {FirstSubmissionDto} data
   * @returns {ApplicationDto}
   * @throws {BadRequestException} BadRequestException
   */
  private checkApplication(data: FirstSubmissionDto): ApplicationDto {
    if (data.educationStatus === EducationStatus.검정고시) {
      return {
        screening: data.screening,
        teacherCellphoneNumber: 'null',
        schoolName: 'null',
        guardianCellphoneNumber: this.checkPhoneNumber(
          data.guardianCellphoneNumber,
        ),
      };
    }

    if (!data.teacherCellphoneNumber || !data.schoolName)
      throw new BadRequestException('학교 정보를 입력해 주세요');

    return {
      screening: data.screening,
      schoolName: data.schoolName,
      teacherCellphoneNumber: this.checkPhoneNumber(
        data.teacherCellphoneNumber,
      ),
      guardianCellphoneNumber: this.checkPhoneNumber(
        data.guardianCellphoneNumber,
      ),
    };
  }

  /**
   * applicationDetail 테이블에 들어갈 데이터 필터링 및 검사
   * @param {FirstSubmissionDto} data
   * @param {string} idPhotoUrl
   * @returns {ApplicationDetailDto}
   */
  private checkApplicationDetail(
    data: FirstSubmissionDto,
    idPhotoUrl: string,
  ): ApplicationDetailDto {
    if (data.educationStatus === EducationStatus.검정고시)
      return {
        idPhotoUrl,
        address: data.address,
        guardianName: data.guardianName,
        guardianRelation: data.guardianRelation,
        teacherName: 'null',
        educationStatus: data.educationStatus,
        graduationYear: data.graduationYear,
        graduationMonth: data.graduationMonth,
        firstWantedMajor: data.firstWantedMajor,
        secondWantedMajor: data.secondWantedMajor,
        thirdWantedMajor: data.thirdWantedMajor,
        telephoneNumber: this.checkPhoneNumber(data.telephoneNumber) || 'null',
        addressDetails: data.addressDetails || 'null',
        schoolTelephoneNumber: 'null',
        schoolLocation: 'null',
      };

    if (
      !data.teacherName ||
      !data.schoolTelephoneNumber ||
      !data.schoolLocation
    )
      throw new BadRequestException('학교 정보를 입력해 주세요');

    return {
      idPhotoUrl,
      address: data.address,
      guardianName: data.guardianName,
      guardianRelation: data.guardianRelation,
      teacherName: 'null',
      educationStatus: data.educationStatus,
      graduationYear: data.graduationYear,
      graduationMonth: data.graduationMonth,
      firstWantedMajor: data.firstWantedMajor,
      secondWantedMajor: data.secondWantedMajor,
      thirdWantedMajor: data.thirdWantedMajor,
      telephoneNumber: this.checkPhoneNumber(data.telephoneNumber) || 'null',
      addressDetails: data.addressDetails || 'null',
      schoolTelephoneNumber:
        this.checkPhoneNumber(data.schoolTelephoneNumber) || 'null',
      schoolLocation: data.schoolLocation,
    };
  }

  /**
   * 성적 계산 체크
   * @param { SecondsSubmissionDto } data
   * @throws { BadRequestException } BadRequestException
   */
  private calcScore(data: SecondsSubmissionDto) {
    const total = data.score2_2 + data.score2_1 + data.score3_1;
    if (
      total !== data.generalCurriculumScoreSubtotal ||
      data.artSportsScore + data.generalCurriculumScoreSubtotal ===
        data.curriculumScoreSubtotal ||
      data.nonCurriculumScoreSubtotal ===
        data.attendanceScore + data.volunteerScore ||
      data.curriculumScoreSubtotal + data.nonCurriculumScoreSubtotal ===
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
    if (cellphoneNumber.includes('+82'))
      throw new BadRequestException('잘못된 전화번호 입력 방식입니다');
    return cellphoneNumber.replace(/[- /]/g, '');
  }

  /**
   * Application 조회
   * @param {number} user_idx
   * @throws {BadRequestException} BadRequestException
   */
  private async getUserApplication(user_idx: number) {
    const user = await this.prisma.user.findFirst({
      where: { user_idx },
      select: {
        application: {
          select: {
            applicationIdx: true,
            application_score: true,
            isFinalSubmission: true,
          },
        },
      },
    });

    if (!user.application)
      throw new BadRequestException('1차 서류가 작성되지 않았습니다');
    if (user.application.isFinalSubmission)
      throw new BadRequestException('최종 제출된 서류는 수정할 수 없습니다');

    return user;
  }
}
