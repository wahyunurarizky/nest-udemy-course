import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm'
import { Event } from './event.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, Logger } from '@nestjs/common'
import { AttendeeAnswerEnum } from './attendee.entity'
import { ListEvents, WhenEventFilter } from './input/list.events'
import { PaginateOptions, paginate } from 'src/pagination/paginator'
import { CreateEventDto } from './input/create-event.dto'
import { User } from 'src/auth/user.entity'

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name)

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepository.createQueryBuilder('e').orderBy('e.id', 'DESC')
  }

  public async getEvent(id: number): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id = :id',
      { id },
    )

    this.logger.debug(query.getSql())

    return await query.getOne()
  }

  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      )
  }

  private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery()

    if (!filter) {
      return query
    }

    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURRENT_DATE AND e.when <= CURRENT_DATE + INTERVAL 1 DAY`,
        )
      }
    }

    this.logger.debug(query.getSql())

    return await query
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions,
    )
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute()
  }

  public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
    return await this.eventsRepository.save({
      ...input,
      organizer: user,
      when: new Date(input.when),
    })
  }
}
