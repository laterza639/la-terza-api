import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SnackImage } from "./snack-image.entity";

@Entity()
export class Snack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @OneToOne(() => SnackImage, (snackImage) => snackImage.snack, { cascade: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  img?: SnackImage;
}
