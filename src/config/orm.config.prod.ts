import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { Event } from './../events/event.entity'
import { User } from 'src/auth/user.entity'
import { Profile } from 'src/auth/profile.entity'

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // entities: [User, Profile],
    autoLoadEntities: true,
    synchronize: true,
  }),
)
