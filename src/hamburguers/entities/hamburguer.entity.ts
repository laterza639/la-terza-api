import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { HamburguerImage } from ".";

@Entity()
export class Hamburguer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {unique: true})
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  ingredients: string;

  @OneToOne(() => HamburguerImage, (hamburguerImage) => hamburguerImage.hamburguer, {cascade: true, eager: true, onDelete: 'SET NULL'})
  @JoinColumn()
  img?: HamburguerImage;
}
