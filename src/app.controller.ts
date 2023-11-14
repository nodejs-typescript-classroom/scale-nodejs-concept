import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('blocking')
  blocking() {
    return this.appService.blocking();
  }
  @Get('non-blocking')
  async nonBlocking() {
    return this.appService.nonBlocking();
  }

  @Get('promises')
  async promises() {
    return this.appService.promises();
  }

  @Get('promises-parallel')
  async promisesParallel() {
    return this.appService.promisesParallel();
  }
}
