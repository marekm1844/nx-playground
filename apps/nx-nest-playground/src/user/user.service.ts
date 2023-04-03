import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from './user.repository';
import User from './user.entity';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository  ){}

  getUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

}