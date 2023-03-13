// BOUDACHER Sylvain 5IW4
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Task,
  UpdateTaskRequest,
} from 'src/stubs/task/v1alpha/task';

import { TaskService } from './task.service';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  createTask(data: CreateTaskRequest) {
    const newTask = data.task;

    return this.taskService.create(newTask as any);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();

    const res = ListTasksResponse.create({
      tasks: tasks.map((t) =>
        Task.create({
          id: t.id,
          title: t.title,
          description: t.description,
        }),
      ),
    });

    return res;
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try {
      const task = request.id;

      return this.taskService.findById(task) as any;
    } catch (error) {
      console.log('error', error);

      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest) {
    const task = request.task;

    return this.taskService.update(task.id, task as any) as any;
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    const task = request.id;

    console.log('request', request);

    console.log('task', task);

    return this.taskService.remove(task) as any;
  }
}
