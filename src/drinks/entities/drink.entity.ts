import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DrinkImage } from "./index";

@Entity()
export class Drink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  size: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @OneToOne(() => DrinkImage, (drinkImage) => drinkImage.drink, { cascade: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  img?: DrinkImage;
}
