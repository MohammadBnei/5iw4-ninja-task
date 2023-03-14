import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { handlePrismaError } from 'src/handlePrismaError';
import { Logger } from '@nestjs/common';
@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  create(createTaskDto: CreateTaskDto) {
    try {
      return this.prisma.task.create({
        data: createTaskDto,
      });
    } catch (error) {
      throw handlePrismaError(error, 'Task', null);
    }
  }

  findAll() {
    return this.prisma.task.findMany();
  }

  async findById(id: number) {
    try {
      return this.prisma.task.findUniqueOrThrow({
        where: {
          id: id
        },
      });
    } catch (error) {
      throw handlePrismaError(error, 'Task', id);
    }
  }

  async update(id: number, data: CreateTaskDto) {
    const task = await this.findById(id);

    try {
      return this.prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error, 'Task', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error, 'Task', id);
    }
  }
}
