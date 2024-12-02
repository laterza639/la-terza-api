import { Drink } from './index';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class DrinkImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @OneToOne(() => Drink, (drink) => drink.img)
  drink: Drink;
}