import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/lib/env';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirstSubmission } from './dto';
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
    { user, application }: FirstSubmission,
    idPhotoUrl: string,
  ) {
    await this.prisma.user.update({
      where: { user_idx },
      data: {
        ...user,
      },
    });

    if (
      application.firstWantedMajor === application.secondWantedMajor ||
      application.firstWantedMajor === application.thirdWantedMajor ||
      application.secondWantedMajor === application.thirdWantedMajor
    )
      throw new BadRequestException(
        '각 지망학과는 각각 다르게 지원해야 합니다.',
      );

    if (application.educationStatus === '검정고시') {
      await this.prisma.application_details.create({
        data: {
          applicationIdx: user_idx,
          idPhotoUrl,
          ...application,
          teacherName: 'none',
          schoolLocation: 'none',
          schoolTelephoneNumber: 'none',
          telephoneNumber: application.telephoneNumber || 'none',
          addressDetails: application.addressDetails || 'none',
        },
      });

      return;
    }

    await this.prisma.application_details.create({
      data: {
        applicationIdx: user_idx,
        idPhotoUrl,
        ...application,
        telephoneNumber: application.telephoneNumber || 'none',
        addressDetails: application.addressDetails || 'none',
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
}
