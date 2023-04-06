import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IUserRepository, USER_REPOSITORY } from './user.repository';
import User from './user.entity';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: DeepMocked<IUserRepository>;

  beforeEach(async () => {

    userRepository = createMock<IUserRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });


  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password' },
        { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', password: 'password' },
      ];
      jest.spyOn(userRepository, 'findAll').mockResolvedValue(users);

      const result = await userService.getUsers();

      expect(result).toEqual(users);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });
});