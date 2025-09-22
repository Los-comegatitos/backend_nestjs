import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('client_type')
export class ClientType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  /*
  Cliente guarda un tipo e cliente pero está en la no relacional,
   entonces no es una relación directa
   */
}
