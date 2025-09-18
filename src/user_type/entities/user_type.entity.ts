
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('user_types')
@Unique(['name'])
export class UserType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;
}
