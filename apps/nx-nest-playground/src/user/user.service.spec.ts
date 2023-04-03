import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('getUsers', () => {
  let service: UserService;

  beforeAll(async () => {
   const app = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = app.get<UserService>(UserService);

  });

  it('should return an array of users with names', () => {
    const users = service.getUsers();
        expect(users).toEqual([
      { name: 'John' },
      { name: 'Jane' },
    ]);
  });
});