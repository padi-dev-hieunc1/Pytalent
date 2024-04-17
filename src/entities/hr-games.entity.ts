import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { Users } from './users.entity';
import { GameCategoryEnum } from '@common/enum/game-category.enum';

@Entity()
export class HrGames extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'category',
    type: 'enum',
    enum: GameCategoryEnum,
  })
  category: GameCategoryEnum;

  @Column()
  hrId: number;

  @ManyToOne(() => Users, (user) => user.hr)
  @JoinColumn({ name: 'hrId' })
  hr: Users;
}
