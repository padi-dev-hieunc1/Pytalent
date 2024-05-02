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
import { Games } from './games.entity';

@Entity()
export class HrGames extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hrId: number;

  @Column()
  gameId: number;

  @ManyToOne(() => Users, (user) => user.hr_game)
  @JoinColumn({ name: 'hrId' })
  hr: Users;

  @ManyToOne(() => Games, (game) => game.hr_game)
  @JoinColumn({ name: 'gameId' })
  game: Games;
}
