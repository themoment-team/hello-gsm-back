import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/lib/env';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApplicationDetailDto,
  ApplicationDto,
  FirstSubmissionDto,
  SecondsSubmissionDto,
  UserDto,
} from './dto';
import { v1 } from 'uuid';
import * as AWS from 'aws-sdk';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  s3 = new AWS.S3({
    accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
    secretAccessKey: this.configService.get<string>('AWS_S3_KEY_SECRET'),
  });

  async firstSubmission(
    user_idx: number,
    data: FirstSubmissionDto,
    photo: Express.Multer.File,
  ) {
    const user = await this.prisma.user.update({
      where: { user_idx },
      data: {
        ...this.checkUser(data),
      },
      include: { application: true },
    });

    if (user.application)
      throw new BadRequestException('이미 작성된 원서가 있습니다.');

    this.checkMajor(data);

    // const idPhotoUrl = await this.s3_upload(photo);

    await this.prisma.application.create({
      data: {
        ...this.checkApplication(data),
        user: { connect: { user_idx } },
        application_details: {
          create: {
            ...this.checkApplicationDetail(data, '어쨌든 이미지'),
          },
        },
      },
    });

    return '1차 서류 저장에 성공했습니다';
  }

  async s3_upload(photo: Express.Multer.File): Promise<string> {
    if (!photo) throw new BadRequestException('Not Found file');

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
      Logger.error(`${photo.filename} failed upload`, e);
      throw new BadRequestException('업로드에 실패했습니다.');
    }
  }

  async secondsSubmission(
    data: SecondsSubmissionDto,
    user_idx: number,
  ): Promise<string> {
    this.prisma.application_score.create({
      data: {
        ...data,
        score1_1: 0,
        score1_2: 0,
        applicationIdx: user_idx,
      },
    });

    return '저장에 성공했습니다';
  }

  async firstSubmissionPatch(
    user_idx: number,
    data: FirstSubmissionDto,
    photo: Express.Multer.File,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { user_idx },
      include: { application_details: true },
    });

    if (!application || !application.application_details)
      throw new BadRequestException('작성된 원서가 없습니다');

    this.checkDate(data.birth);
    this.checkMajor(data);

    // const idPhotoUrl = await this.s3_upload(photo);

    await this.prisma.user.update({
      where: { user_idx },
      data: {
        ...this.checkUser(data),
        birth: new Date(data.birth),
        application: {
          update: {
            ...this.checkApplication(data),
            application_details: {
              update: {
                ...this.checkApplicationDetail(data, '어쨌든 이미지'),
              },
            },
          },
        },
      },
    });

    return '수정에 성공했습니다';
  }

  private checkUser(data: FirstSubmissionDto): UserDto {
    this.checkDate(data.birth);

    return {
      name: data.name,
      gender: data.gender,
      birth: new Date(data.birth),
      cellphoneNumber: this.checkPhoneNumber(data.cellphoneNumber),
    };
  }

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

  private checkApplication(data: FirstSubmissionDto): ApplicationDto {
    if (data.educationStatus === '검정고시') {
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

  private checkApplicationDetail(
    data: FirstSubmissionDto,
    idPhotoUrl: string,
  ): ApplicationDetailDto {
    if (data.educationStatus === '검정고시')
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

  private checkDate(birth: string): Date {
    if (new Date(birth).toString() === 'Invalid Date')
      throw new BadRequestException('잘못된 날짜 형식입니다');
    return new Date(birth);
  }

  private checkPhoneNumber(cellphoneNumber: string) {
    if (cellphoneNumber.includes('+82'))
      throw new BadRequestException('잘못된 전화번호 입력 방식입니다');
    return cellphoneNumber.replace(/[- /]/g, '');
  }
}
