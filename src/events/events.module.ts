import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsController } from './events.controller'
import { Event } from './event.entity'
import { Attendee } from './attendee.entity'
import { EventsService } from './events.service'

@Module({
  // if you inject you should add module
  imports: [TypeOrmModule.forFeature([Event, Attendee])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}