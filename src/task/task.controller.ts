import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  GetTaskRequest,
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
  async GetTask(request: GetTaskRequest): Promise<Task> {
    const task = await this.taskService.findById(request.id);

    return Task.create({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: Status[task.status],
    });
  }
}
