import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class AppJapanService {
  constructor(
    @Inject('APP_NAME') private readonly name: string,

    @Inject('MESSAGE') private readonly message: string,
  ) {}

  getHello(): string {
    console.log(process.env.APP_EMAIL)
    return `bhs jepang from ${this.name} and message ${this.message}`
  }
}
