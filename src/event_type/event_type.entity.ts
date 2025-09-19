import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { IsNotEmpty, MaxLength } from 'class-validator';

@Entity('event_types')
@Unique(['name'])
export class EventType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
