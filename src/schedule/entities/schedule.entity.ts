import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('time without time zone', { nullable: true })
  morningOpenTime: string | null;

  @Column('time without time zone', { nullable: true })
  morningCloseTime: string | null;

  @Column('time without time zone', { nullable: true })
  eveningOpenTime: string | null;

  @Column('time without time zone', { nullable: true })
  eveningCloseTime: string | null;

  @Column('boolean', { default: true })
  isOpen: boolean;

  @Column('text')
  branch: string;
}