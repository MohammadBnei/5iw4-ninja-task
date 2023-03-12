import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';
import {
  GrpcAlreadyExists,
  GrpcNotFoundException,
  GrpcUnknownException,
} from 'src/exceptions/grpc.exceptions';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  create(task: Task) {
    let createdTask = null;
    try {
      createdTask = this.prisma.task.create({
        data: task,
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new GrpcAlreadyExists(`Task with id ${task.id} already exists`);
      }
      throw new GrpcUnknownException(error.message);
    }

    return createdTask;
  }

  findAll() {
    return this.prisma.task.findMany();
  }

  async findById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new GrpcNotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  async update(id: number, data: Task) {
    let updatedTask = null;
    try {
      updatedTask = await this.prisma.task.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new GrpcNotFoundException(`Task with id ${id} not found`);
      }
      throw new GrpcUnknownException(error.message);
    }

    return updatedTask;
  }

  async remove(id: number) {
    let deletedTask = null;
    try {
      deletedTask = await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new GrpcNotFoundException(`Task with id ${id} not found`);
      }
      throw new GrpcUnknownException(error.message);
    }

    return deletedTask;
  }
}
