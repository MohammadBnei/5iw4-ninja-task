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
import { type } from 'os';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  createTask(data: CreateTaskRequest) {
    if (!data.task) {
      throw new RpcException({
        code: 400,
        message: 'Task is required',
      });
    } else if (
      !data.task.title ||
      !data.task.description ||
      !data.task.dueDate ||
      !data.task.status
    ) {
      throw new RpcException({
        code: 400,
        message: 'Task title, description, dueDate and status are required',
      });
    }

    const newTask = data.task;

    return this.taskService.create(newTask as any);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    console.log({ tasks });

    if (!tasks) {
      throw new RpcException({
        code: 404,
        message: 'No tasks found',
      });
    }

    const res = ListTasksResponse.create({
      tasks: tasks.map((t) =>
        Task.create({
          title: t.title,
        }),
      ),
    });

    return res;
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<any> {
    if (!request.id) {
      throw new RpcException({
        code: 400,
        message: 'Task id is required',
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
          updatedTask.status = OtherStatus.doing as any;
          break;
        case Status.DONE:
          updatedTask.status = OtherStatus.done as any;
          break;
        default:
          updatedTask.status = OtherStatus.todo as any;
      }
    }

    const task = await this.taskService.update(
      updatedTask.id,
      updatedTask as any,
    );

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
        message: 'Task id is required',
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
