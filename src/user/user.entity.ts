import { User_Type } from "src/user_type/user_type.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
  
  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  birthDate: Date;

  @Column()
  password: string;

  @ManyToOne(() => User_Type, typeuser => typeuser.users, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_type_id' }) // FK
  typeuser: User_Type;

}
