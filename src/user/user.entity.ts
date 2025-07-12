import { Message } from 'src/chat/message.entity';
import { TeamPost } from 'src/team-post/team-post.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Notification } from '../notification/entities/notification.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null
  })
  avatar: string | null;

  @Column({ nullable: true })
  skill: string;

  @Column({ default: false })
  isDarkMode: boolean;

  @Column({ type: 'enum', enum: ['en', 'ar'], default: 'en' })
  language: 'en' | 'ar';

@Column({ nullable: true, type: 'varchar' })
otpCode: string | null;

@Column({ nullable: true, type: 'datetime' })
otpExpiry: Date | null;

@Column({ type: 'varchar', nullable: true })
currentToken: string | null;

@OneToMany(() => TeamPost, (post) => post.user)
posts: TeamPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    @Column({ default: false })
isVerified: boolean;

   @OneToMany(() => Notification, (notif) => notif.user)
notifications: Notification[];

  @OneToMany(() => Message, (message) => message.sender)
sentMessages: Message[];

@OneToMany(() => Message, (message) => message.receiver)
receivedMessages: Message[];
}
