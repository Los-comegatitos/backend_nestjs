import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('client_type')
export class ClientType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;

  /*
  Cliente guarda un tipo e cliente pero está en la no relacional,
   entonces no es una relación directa
   */
}
