import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";

export const USER_REPOSITORY = Symbol('IUsersRepository');

export interface IUserRepository {
    findAll(): Promise<User[]>;
}

export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>
  ) {}

  findAll(): Promise<User[]> {
    return this.repository.find();
  }
}