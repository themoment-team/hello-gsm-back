import { Body, Controller, Get, Patch } from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUserState(@User('user_idx') user_idx: number) {
    return this.userService.getUserState(user_idx);
  }

  @Patch()
  async updateUser(@User('user_idx') user_idx: number, @Body() data: UserDto) {
    return this.userService.updateUser(user_idx, data);
  }

  @Get('/info')
  async getUserInfo(@User('user_idx') user_idx: number) {
    return this.userService.getUserInfo(user_idx);
  }
}
