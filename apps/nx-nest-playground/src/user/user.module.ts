import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './user.entity';
import { USER_REPOSITORY, UserRepository} from './user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
     {
      provide: USER_REPOSITORY,
      useClass: UserRepository
     },
     UserService],
  exports: [UserService]
})
export class UserModule {}