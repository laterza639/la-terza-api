import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Snack } from "./snack.entity";

@Entity()
export class SnackImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @OneToOne(() => Snack, (snack) => snack.img)
  snack: Snack;
}