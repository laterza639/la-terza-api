import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DessertImage } from "./dessert-image.entity";

@Entity()
export class Dessert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  branch: string;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @OneToOne(() => DessertImage, (dessertImage) => dessertImage.dessert, { cascade: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  img?: DessertImage;
}
