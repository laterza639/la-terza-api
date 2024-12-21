import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { HamburguersModule } from './hamburguers/hamburguers.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtrasModule } from './extras/extras.module';
import { DessertsModule } from './desserts/desserts.module';
import { DrinksModule } from './drinks/drinks.module';
import { SnacksModule } from './snacks/snacks.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from "path";
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false
      }
    }),
    HamburguersModule,
    ExtrasModule,
    DessertsModule,
    DrinksModule,
    SnacksModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static'
    }),
    ScheduleModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
