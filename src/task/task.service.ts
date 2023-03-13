/** GEOFFRON Thomas 5IW4 */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    createTaskDto.dueDate = new Date(createTaskDto.dueDate);
    createTaskDto.status = Status.todo;

    return this.prisma.task.create({
      data: createTaskDto,
    });
  }

  findAll() {
    return this.prisma.task.findMany();
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

  async update(id: number, data: UpdateTaskDto) {
    const task = await this.findById(id);

    try {
      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
      }

      return this.prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(error.message);
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
}
