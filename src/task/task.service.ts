//RENOUX Océane 5IW4

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    try {
      return await this.prisma.task.create({
        data: createTaskDto,
      });
    } catch (error) {
      console.log(error)
      if (error?.code === 'P2002') {
        throw new NotFoundException(`Task already exists`);
      }
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return this.prisma.task.findMany();
  }

  async findPage( pageSize : number , pageToken : number ) {
    const where = pageToken ? { id:  pageToken  } : {};
    const tasks = await this.prisma.task.findMany({
      take: pageSize,
      where,
      orderBy: { id: 'asc' },
    });
    if (!tasks || tasks.length === 0) {
      throw new NotFoundException(`tasks with id ${pageToken}  not found`);
    }
    return tasks;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = this.prisma.task.update({
      where: { id: id },
      data: updateTaskDto,
    });
    if (!task) {
      throw new NotFoundException(`task with id ${id}  not found`);
    }
    return task;
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: id },
    });
    if (!task) {
      throw new NotFoundException(`task with id ${id}  not found`);
    }
    return task;
  }


  async remove(id: number) {
    try {
      return await this.prisma.task.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Task with id ${id} not found`);
      }
      throw new BadRequestException(error.message);
    }
  }
}
