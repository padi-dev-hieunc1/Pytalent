import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { LogicalResultEnum } from '@common/enum/logical-result.enum';
import { LogicalAnswers } from './logical-answers.entity';

@Entity()
export class LogicalQuestions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  first_statement: string;

  @Column()
  second_statement: string;

  @Column()
  conclusion: string;

  @Column({
    name: 'result',
    type: 'enum',
    enum: LogicalResultEnum,
  })
  result: LogicalResultEnum;

  @OneToMany(
    () => LogicalAnswers,
    (logical_answer) => logical_answer.logical_question,
  )
  logical_answer: LogicalAnswers[];
}
