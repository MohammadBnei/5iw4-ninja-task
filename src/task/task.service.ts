import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  delete(id: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
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

  async update(id: number, data: CreateTaskDto) {
    const task = await this.findById(id);

    try {
      return this.prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Task with id ${id} not found`);
      }
      if (error?.code === 'P2002') {
        throw new BadRequestException(`Invalid id ${id}`);
      }
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          `Foreign key constraint failed on the Task with id ${id}`,
        );
      }
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
      if (error?.code === 'P2002') {
        throw new BadRequestException(`Invalid id ${id}`);
      }
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          `Foreign key constraint failed on the Task with id ${id}`,
        );
      }
      throw new BadRequestException(error.message);
    }
  }
}
