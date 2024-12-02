import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Dessert } from "./dessert.entity";

@Entity()
export class DessertImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @OneToOne(() => Dessert, (dessert) => dessert.img)
  dessert: Dessert;
}