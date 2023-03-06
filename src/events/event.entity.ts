import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Attendee } from './attendee.entity'
import { User } from 'src/auth/user.entity'

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  when: Date

  @Column()
  address: string

  @OneToMany(() => Attendee, (attendee) => attendee.event, {
    cascade: true,
  })
  attendees: Attendee[]

  @ManyToOne(() => User, (user) => user.orginized)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User

  @Column()
  organizer_id: number

  attendeeCount?: number
  attendeeRejected?: number
  attendeeMaybe?: number
  attendeeAccepted?: number
}
