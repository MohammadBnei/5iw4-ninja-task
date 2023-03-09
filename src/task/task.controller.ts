import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Task,
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

  // @GrpcMethod('TaskService')
  // async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
  //   return this.taskService.remove(request.name as any) as any;
  // }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    const task = request.id;

    return this.taskService.findById(task) as any;
  }
}
