import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/lib/env';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirstSubmission, SecondsSubmissionDto } from './dto';
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
    { user, application, applicationDetail }: FirstSubmission,
    idPhotoUrl: string,
  ) {
    await this.prisma.user.update({
      where: { user_idx },
      data: {
        ...user,
      },
    });

    if (
      applicationDetail.firstWantedMajor ===
        applicationDetail.secondWantedMajor ||
      applicationDetail.firstWantedMajor ===
        applicationDetail.thirdWantedMajor ||
      applicationDetail.secondWantedMajor === applicationDetail.thirdWantedMajor
    )
      throw new BadRequestException(
        '각 지망학과는 각각 다르게 지원해야 합니다.',
      );

    const newApplication = await this.prisma.application.create({
      data: {
        ...application,
        teacherCellphoneNumber:
          this.CellphoneNumberReplace(application.teacherCellphoneNumber) ||
          'null',
        schoolName: application.schoolName || 'null',
        guardianCellphoneNumber: this.CellphoneNumberReplace(
          application.guardianCellphoneNumber,
        ),
        user: { connect: { user_idx } },
      },
    });

    if (applicationDetail.educationStatus === '검정고시') {
      await this.prisma.application_details.create({
        data: {
          ...applicationDetail,
          idPhotoUrl,
          telephoneNumber: 'null',
          addressDetails: applicationDetail.addressDetails || 'null',
          schoolTelephoneNumber: 'null',
          schoolLocation: 'null',
          application: {
            connect: { applicationIdx: newApplication.applicationIdx },
          },
        },
      });
      return;
    }

    await this.prisma.application_details.create({
      data: {
        ...applicationDetail,
        idPhotoUrl,
        telephoneNumber:
          this.CellphoneNumberReplace(applicationDetail.telephoneNumber) ||
          'null',
        addressDetails:
          this.CellphoneNumberReplace(applicationDetail.addressDetails) ||
          'null',
        schoolTelephoneNumber:
          this.CellphoneNumberReplace(
            applicationDetail.schoolTelephoneNumber,
          ) || 'null',
        application: {
          connect: { applicationIdx: newApplication.applicationIdx },
        },
      },
    });
  }

  async s3_upload(photo: Express.Multer.File): Promise<string> {
    const params = {
      Bucket: this.configService.get(ENV.AWS_S3_BUCKET_NAME),
      Key: photo.filename,
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

  async secondsSubmission(data: SecondsSubmissionDto, user_idx: number) {
    this.prisma.application_score.create({
      data: {
        ...data,
        score1_2: 1,
        score1_1: 1,
        applicationIdx: user_idx,
      },
    });
  }

  CellphoneNumberReplace(cellphoneNumber: string) {
    return cellphoneNumber.replace(/[- /]/g, '');
  }
}
