import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class TeamPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  duration: string;

  @Column()
  missingPlayers: number;

  @Column({ nullable: true })
  description?: string;

  @Column('varchar', { length: 500, nullable: true })
  image: string | null;

  @Column({ nullable: true })
  phone?: string;

  @ManyToOne(() => User, user => user.posts)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}