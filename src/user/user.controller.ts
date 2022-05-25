import { Controller, Get } from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUserState(@User('user_idx') user_idx: number) {
    return this.userService.getUserState(user_idx);
  }

  @Get('/info')
  async getUserInfo(@User('user_idx') user_idx: number) {
    return this.userService.getUserInfo(user_idx);
  }
}
