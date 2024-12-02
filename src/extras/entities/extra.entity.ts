import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Extra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
