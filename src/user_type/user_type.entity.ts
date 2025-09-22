import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user_types')
export class User_Type {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;

  // Relacion OneToOne con User
  @OneToMany(() => User, (user) => user.typeuser)
  users: User[];
}
