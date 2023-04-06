import { CacheInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  getUsers() {
    return this.userService.getUsers();
  }
}