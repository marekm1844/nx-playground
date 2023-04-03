//create user entity with typeorm   
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'first_name', type: 'varchar', nullable: true})
  firstName: string;

  @Column({name: 'last_name', type: 'varchar', nullable: true})
  lastName: string;

  @Column({name: 'email', type: 'varchar', nullable: true})
  email: string;

  @Column({name: 'password', type: 'varchar', nullable: true})
  password: string;
}    

export default User;
