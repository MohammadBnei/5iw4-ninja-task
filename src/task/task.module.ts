import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MapperService } from 'src/mapper/mapper.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService, MapperService],
})
export class TaskModule {}
