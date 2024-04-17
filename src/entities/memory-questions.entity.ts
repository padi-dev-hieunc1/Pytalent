import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';

@Entity()
export class MemoryQuestions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column('text')
  title: string;

  @Column()
  arrow_count: number;

  @Column()
  time_limit: number;
}
