import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Status,
  Task,
  UpdateTaskRequest,
} from 'src/stubs/task/v1alpha/task';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

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
  async GetTask(request: GetTaskRequest): Promise<GetTaskRequest> {
    return this.taskService.findById(request.id);
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<UpdateTaskRequest> {
    return this.taskService.update(request.task.id, request.task as any) as any;
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<DeleteTaskRequest> {
    return this.taskService.remove(request.id);
  }
}
