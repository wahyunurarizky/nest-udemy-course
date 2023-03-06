import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateEventDto } from './input/create-event.dto'
import { Event } from './event.entity'
import { UpdateEventDto } from './input/update-event.dto'
import { Like, MoreThan, Repository } from 'typeorm'
import { Attendee } from './attendee.entity'
import { EventsService } from './events.service'
import { ListEvents } from './input/list.events'
import { CurrentUser } from 'src/auth/current-user.decorator'
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt'
import { User } from 'src/auth/user.entity'

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name)

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  // this is for query prams populate by default
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    this.logger.log(`Hit the find all route`)
    this.logger.debug(filter.when, filter.page)
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: Number(filter.limit),
        },
      )
    this.logger.debug(events)
    return events
  }

  @Get('/practice')
  async getPractice() {
    return await this.eventRepository.find({
      select: ['id', 'when'],
      where: [
        { id: MoreThan(1), when: MoreThan(new Date('2021-10-10')) },
        {
          description: Like('%meet%'),
        },
      ],
      take: 2,
      skip: 0,
      order: {
        id: 'DESC',
      },
    })
  }

  @Get('practice2')
  async getPractice2() {
    const event = await this.eventRepository.findOne({
      where: { id: 1 },
      relations: ['attendees'],
    })
    // return event

    // const event = new Event()
    // event.id = 1

    // const attendee = new Attendee()

    // attendee.name = 'kerenss'

    // event.attendees.push(attendee)

    // await this.eventRepository.save(event)

    const attendee = new Attendee()
    attendee.name = 'Jerry the second'
    // attendee.event = event

    event.attendees = []

    await this.eventRepository.save(event)

    return event
  }

  @Get('practice3')
  async getPractice3() {
    return await this.eventRepository
      .createQueryBuilder('e')
      .select(['e.id', 'e.name'])
      .orderBy('e.id', 'DESC')
      .take(3)
      .getMany()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(typeof id)
    const event = await this.eventsService.getEvent(id)

    if (!event) {
      throw new NotFoundException()
    }
    return event
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  async create(@Body() input: CreateEventDto, @CurrentUser() user) {
    return await this.eventsService.createEvent(input, user)
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  async update(
    @Param('id') id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventRepository.findOneBy({ id })

    if (!event) {
      throw new NotFoundException()
    }

    if (event.organizer_id !== user.id) {
      throw new ForbiddenException(
        null,
        'you are not authorized to update this event',
      )
    }

    return await this.eventRepository.save({
      ...event,
      when: input.when ? new Date(input.when) : event.when,
    })
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(@Param('id') id, @CurrentUser() user: User) {
    const event = await this.eventRepository.findOneBy({ id })

    if (!event) {
      throw new NotFoundException()
    }

    if (event.organizer_id !== user.id) {
      throw new ForbiddenException(
        null,
        'you are not authorized to delete this event',
      )
    }

    await this.eventsService.deleteEvent(id)
  }
}
