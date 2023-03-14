import {BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import {CreateTaskDto} from './dto/create-task.dto';
import {PrismaService} from '../prisma/prisma.service';
import {UpdateTaskDto} from "./dto/update-task.dto";
import {RpcException} from "@nestjs/microservices";

@Injectable()
export class TaskService {
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

  async update(id: number, data: UpdateTaskDto) {
    try {
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
        throw new RpcException(`Task with id ${id} not found`);
      }
      throw new BadRequestException(error.message);
    }
  }
}
