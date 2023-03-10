import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
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
  updateTask(data: UpdateTaskRequest) {
    const task = data.task;

    return this.taskService.update(task.id, task as any);
  }

  @GrpcMethod('TaskService')
  deleteTask(data: DeleteTaskRequest) {
    const id = data.id;

    return this.taskService.remove(id);
  }

  @GrpcMethod('TaskService')
  getTask(data: GetTaskRequest) {
    const id = data.id;

    return this.taskService.findById(id);
  }
}
