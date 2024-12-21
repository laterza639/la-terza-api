import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Extra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  price: number;

  @Column('text')
  branch: string;

  @Column({ type: 'boolean', default: true })
  available: boolean;
}
