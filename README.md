# scale nodejs concept

This repository is for recap the concept of how to scale a nodejs application

## Event loop: Blocking vs Non-Blocking 

![image](https://i.imgur.com/qpDiVlA.png)


https://nodejs.org/en/docs/guides/blocking-vs-non-blocking

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick

### blocking sample

In main thread

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  blocking() {
    const now = new Date().getTime();
    while (new Date().getTime() < now + 10000) {}
    return {};
  }
}
```

This service will block the main thread to handle this 10000 millisecond work

### with non-blocking revise

We could turn blocking code into promise to allow cpu release the code on blocking code

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  blocking() {
    const now = new Date().getTime();
    while (new Date().getTime() < now + 10000) {}
    return {};
  }

  async nonBlocking() {
    return new Promise(async (resolve) => {
      setTimeout(() => {
        resolve({});
      }, 100000);
    });
  }
}

```

add non-blocking-route

```typescript
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
}
```

This way the non-blocking code will auto dispatch by event loop and will not blocking other code

## Concurrency

In Nodejs, Concurrency means the Event loop ability that handle callback after finish another callback

### Parallel

Parallel is ability to handle multiple task at the sample time


### sample the promise all

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World!';
  }

  blocking() {
    const now = new Date().getTime();
    while (new Date().getTime() < now + 10000) {}
    return {};
  }

  async nonBlocking() {
    return new Promise(async (resolve) => {
      setTimeout(() => {
        resolve({});
      }, 100000);
    });
  }

  async promises() {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(await this.sleep());
    }
    return results;
  }

  async promisesParallel() {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(this.sleep());
    }
    return Promise.all(results);
  }
  private async sleep() {
    return new Promise((resolve) => {
      this.logger.log('Start sleep');
      setTimeout(() => {
        this.logger.log('Sleep complete');
        resolve({});
      }, 1000);
    });
  }
}

```
add route for sample
```typescript
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

```

however, the promise has memory cost

thus, could not spread no limit promises parallel

usaualy group related datasource promise together

And CPU-intensive job could not use this way to scale 

## install autocannon to do load testing

```shell
pnpm i -S autocannon
```

load testing 10000 concurrent request with timeout 30s duration 60s

```shell
pnpm autocannon localhost:3000/promises -c 100000 -t 30 -d 60
```

## With Mutiple core the cpu bound could load balance the cpu intensive job

create deployment yaml by kubectl

```shell
helm create scale-nodejs-concept
cd k8s/scale-nodejs-concept/template
kubectl create deployment scale-nodejs-concept --image=yuanyu90221/scale-nodejs-concept:dev --port 3000
 --dry-run=client -o yaml > deployment.yml
kubectl create svc nodeport scale-nodejs-concept --tcp=3000:3000 --dry-run=client -o yaml > service.yml
```

install helm chart

```shell
cd ..
helm install
```