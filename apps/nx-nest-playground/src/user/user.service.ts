import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getUsers(): { name: string }[] {
    return [{ name: 'John' }, { name: 'Jane' }];
  }
}