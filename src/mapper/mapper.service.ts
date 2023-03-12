import { Injectable } from '@nestjs/common';
import { Task as PrismaTask, Status as PrismaStatus } from '@prisma/client';
import {
  Task as GrpcTask,
  Status as GrpcStatus,
} from 'src/stubs/task/v1alpha/task';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';

@Injectable()
export class MapperService {
  private readonly prismaStatusToGrpcStatusMap: Record<
    PrismaStatus,
    GrpcStatus
  > = {
    todo: GrpcStatus.TODO,
    doing: GrpcStatus.DOING,
    done: GrpcStatus.DONE,
  };
  private readonly GrpcStatusToPrismaStatusMap: Record<
    GrpcStatus,
    PrismaStatus
  > = {
    '0': PrismaStatus.todo,
    '1': PrismaStatus.doing,
    '2': PrismaStatus.done,
  };

  public toGrpcTask(task: PrismaTask): GrpcTask {
    return GrpcTask.create({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: this.prismaStatusToGrpcStatusMap[task.status],
    });
  }

  public toPrismaTask(task: GrpcTask): PrismaTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate),
      status: this.GrpcStatusToPrismaStatusMap[task.status],
    };
  }

  public toPrismaTaskId(name: string) {
    return parseInt(name);
  }
}
