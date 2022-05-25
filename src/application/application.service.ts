import { Injectable } from '@nestjs/common';
import { FirstSubmission } from './dto';

@Injectable()
export class ApplicationService {
  async firstSubmission(user_idx: number, data: FirstSubmission) {}
}
