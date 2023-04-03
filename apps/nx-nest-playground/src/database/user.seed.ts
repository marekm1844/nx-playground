import { DataSource } from "typeorm"
import { User } from "../user/user.entity"
import { Logger } from "@nestjs/common"
import { faker } from "@faker-js/faker"



export const userSeed = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(User);
  Logger.log('Seeding users...');

  // Delete existing users
  await repository.delete({});

  //create 10 users
  const users = Array.from({ length: 10 }).map(() => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    return { firstName, lastName, email, password } as User;
  });

  Logger.log(users);
  //save users to database
  return repository.save(users);
};
