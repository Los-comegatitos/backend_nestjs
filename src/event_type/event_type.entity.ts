import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('event_type')
export class EventType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;
}
