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

  @Column({
    name: 'first_statement',
  })
  firstStatement: string;

  @Column({
    name: 'second_statement',
  })
  secondStatement: string;

  @Column()
  conclusion: string;

  @Column()
  score: number;

  @Column({
    name: 'result',
    type: 'enum',
    enum: LogicalResultEnum,
  })
  result: LogicalResultEnum;

  @OneToMany(
    () => LogicalAnswers,
    (logicalAnswer) => logicalAnswer.logicalQuestion,
  )
  logicalAnswer: LogicalAnswers[];
}
