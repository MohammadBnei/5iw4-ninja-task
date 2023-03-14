import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Task as PrismaTask, Status as PrismaStatus } from '@prisma/client';
import {
  Task as GrpcTask,
  Status as GrpcStatus,
} from 'src/stubs/task/v1alpha/task';
import { error } from 'winston';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    try {
      return this.prisma.task.create({
        data: createTaskDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(pageSize = 10, pageToken = '') {
    try {
      const tasks = await this.prisma.task.findMany({
        take: pageSize,
        skip: pageToken ? 1 : 0,
        cursor: pageToken && { id: parseInt(pageToken) },
        orderBy: { id: 'asc' },
      });

      const nextPageToken =
        tasks.length === pageSize ? tasks[tasks.length - 1].id.toString() : '';

      return { items: tasks, nextPageToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, data: CreateTaskDto) {
    const task = await this.findById(id);

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    try {
      return this.prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Task with id ${id} not found`);
      }
      throw new BadRequestException(error.message);
    }
  }

  mapPrismaTaskToGrpcTask(task: PrismaTask): GrpcTask {
    const prismaStatusToGrpc: Record<PrismaStatus, GrpcStatus> = {
      todo: GrpcStatus.TODO,
      doing: GrpcStatus.DOING,
      done: GrpcStatus.DONE,
    };

    return GrpcTask.create({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: prismaStatusToGrpc[task.status],
    });
  }
}
