// ZERRAI Sami 5IW4

import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Status,
  Task,
  GetTaskRequest,
  UpdateTaskRequest,
} from 'src/stubs/task/v1alpha/task';

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
  getTask(data: GetTaskRequest) {
    return this.taskService.findById(data.id);
  }

  @GrpcMethod('TaskService')
  updateTask(updateData: UpdateTaskRequest) {
    return this.taskService.update(updateData.task.id, updateData.task as any);
  }

  @GrpcMethod('TaskService')
  deleteTask(data: GetTaskRequest) {
    return this.taskService.remove(data.id);
  }
}
