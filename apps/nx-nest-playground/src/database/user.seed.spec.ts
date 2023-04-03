import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { faker } from "@faker-js/faker"
import { User } from '../user/user.entity';
import { userSeed } from './user.seed';
import { DataSource } from 'typeorm';

describe('userSeed', () => {
  let dataSource;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  it('should seed 10 users to the database', async () => {
    const users = Array.from({ length: 10 }, () => ({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }));

    userRepository.delete.mockResolvedValue({ affected: 1 });
    userRepository.save.mockResolvedValue(users);

    const result = await userSeed(dataSource);

    expect(Logger.log).toHaveBeenCalledWith('Seeding users...');
    expect(userRepository.delete).toHaveBeenCalledWith({});
    expect(userRepository.save).toHaveBeenCalledWith(users);
    expect(result).toEqual(users);
  });
});
