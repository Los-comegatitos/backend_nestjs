import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service_type')
export class ServiceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;
}
