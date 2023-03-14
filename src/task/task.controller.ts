import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Status,
  Task,
  UpdateTaskRequest,
} from 'src/stubs/task/v1alpha/task';
import { Status as OtherStatus } from '@prisma/client';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @GrpcMethod('TaskService')
  createTask(data: CreateTaskRequest) {
    if (data.task === undefined || data.task === null) {
      throw new RpcException({
        code: 400,
        message: 'Task required',
      });
    } else if (
      !data.task.title ||
      !data.task.description ||
      !data.task.dueDate
    ) {
      throw new RpcException({
        code: 400,
        message: 'Task title or description or dueDate or status are required',
      });
    }
    return this.taskService.create(data.task);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    if (!tasks) {
      throw new RpcException({
        code: 404,
        message: "There isn't any task",
      });
    }
    const listTask = tasks.map((t) =>
      Task.create({
        title: t.title,
      }),
    );
    const res = ListTasksResponse.create({
      tasks: listTask,
    });
    return res;
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<any> {
    if (!request.id) {
      throw new RpcException({
        code: 400,
        message: 'Task id required',
      });
    }
    const task = await this.taskService.findById(request.id);
    if (!task) {
      throw new RpcException({
        code: 404,
        message: "Task doesn't exist",
      });
    }

    return Task.create({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: Status[task.status],
    });
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<any> {
    if (!request.task) {
      throw new RpcException({
        code: 400,
        message: 'Task is required',
      });
    } else if (!request.task.id || typeof request.task.id !== 'number') {
      throw new RpcException({
        code: 400,
        message: 'Task id is required',
      });
    }
    const updatedTask = request.task;

    if (updatedTask.status) {
      switch (updatedTask.status) {
        case Status.DOING:
          updatedTask.status = OtherStatus.doing;
          break;
        case Status.DONE:
          updatedTask.status = OtherStatus.done;
          break;
        default:
          updatedTask.status = OtherStatus.todo;
      }
    }
    const task = await this.taskService.update(updatedTask.id, updatedTask);
    if (!task) {
      throw new RpcException({
        code: 404,
        message: "Task doesn't exist",
      });
    }

    return Task.create({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: Status[task.status],
    });
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: GetTaskRequest): Promise<any> {
    if (!request.id) {
      throw new RpcException({
        code: 400,
        message: 'Task id required',
      });
    }
    const task = await this.taskService.findById(request.id);
    if (!task) {
      throw new RpcException({
        code: 404,
        message: "Task doesn't exist",
      });
    }
    await this.taskService.remove(request.id);
    return { message: 'Task deleted successfully' };
  }
}
