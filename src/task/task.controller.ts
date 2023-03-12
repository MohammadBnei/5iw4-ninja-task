import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Status,
  Task,
} from 'src/stubs/task/v1alpha/task';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  createTask(data: CreateTaskRequest) {
    const newTask = data.task;

    if (!newTask.title) {
      throw new RpcException('Title is required');
    } else if (typeof newTask.title !== 'string') {
      throw new RpcException('Title must be a string');
    }

    if (!newTask.description) {
      throw new RpcException('Description is required');
    } else if (typeof newTask.description !== 'string') {
      throw new RpcException('Description must be a string');
    }

    if (!newTask.status) {
      throw new RpcException('Status is required');
    } else if (
      newTask.status !== Status.TODO &&
      newTask.status !== Status.DOING &&
      newTask.status !== Status.DONE
    ) {
      throw new RpcException('Status must be one of TODO, DOING, DONE');
    }

    return this.taskService.create(newTask as any);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    console.log({ tasks });

    const res = ListTasksResponse.create({
      tasks: tasks.map((t) =>
        Task.create({
          title: t.title,
        }),
      ),
    });

    console.log({ res });

    return res;
  }

  @GrpcMethod('TaskService')
  async GetTask(request: { id: number }): Promise<Task> {
    if (!request.id) {
      throw new RpcException('ID is required');
    } else if (typeof request.id !== 'number') {
      throw new RpcException('ID must be a number');
    }

    const task = await this.taskService.findById(request.id);

    return Task.create({
      title: task.title,
    });
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: {
    id: number;
    task: CreateTaskDto;
  }): Promise<Task> {
    if (!request.id) {
      throw new RpcException('ID is required');
    } else if (typeof request.id !== 'number') {
      throw new RpcException('ID must be a number');
    }

    if (!request.task) {
      throw new RpcException('Task is required');
    } else if (typeof request.task !== 'object') {
      throw new RpcException('Task must be an object');
    }

    const task = await this.taskService.update(request.id, request.task);

    return Task.create({
      title: task.title,
    });
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: { id: number }): Promise<void> {
    if (!request.id) {
      throw new RpcException('ID is required');
    } else if (typeof request.id !== 'number') {
      throw new RpcException('ID must be a number');
    }

    await this.taskService.remove(request.id);

    return;
  }
}
