import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: true, length: 8 })
  morningOpenTime: string | null;

  @Column('varchar', { nullable: true, length: 8 })
  morningCloseTime: string | null;

  @Column('varchar', { nullable: true, length: 8 })
  eveningOpenTime: string | null;

  @Column('varchar', { nullable: true, length: 8 })
  eveningCloseTime: string | null;

  @Column('boolean', { default: true })
  isOpen: boolean;

  @Column('text')
  branch: string;
}