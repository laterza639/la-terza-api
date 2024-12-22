import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SnackImage } from "./snack-image.entity";

@Entity()
export class Snack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  branch: string;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @OneToOne(() => SnackImage, (snackImage) => snackImage.snack, { cascade: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  img?: SnackImage;
}
