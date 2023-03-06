import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { compare } from 'bcrypt'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // must have validate method
  private readonly logger = new Logger(LocalStrategy.name)

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super()
  }

  public async validate(username: string, password: string): Promise<any> {
    // if return an object alias user it means true. but if not throw an error
    const user = await this.userRepository.findOne({
      where: { username },
    })

    if (!user) {
      this.logger.debug('user ${username} not found')
      throw new UnauthorizedException()
    }

    if (!(await compare(password, user.password))) {
      this.logger.debug(`Invalid credentials for username ${username}`)
      throw new UnauthorizedException()
    }

    return user
  }
}
