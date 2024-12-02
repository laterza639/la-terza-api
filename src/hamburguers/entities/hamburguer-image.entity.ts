import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Hamburguer } from "./index";

@Entity()
export class HamburguerImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @OneToOne(() => Hamburguer, (hamburguer) => hamburguer.img)
  hamburguer: Hamburguer;
}