import { Body, Controller } from '@nestjs/common';
import { TaskService } from './task.service';
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

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  async createTask(request: CreateTaskRequest): Promise<Task> {
    if (!request.task) {
      throw new RpcException({ code: 400, message: 'missing params' });
    }
    const newTask = await this.taskService.create(request.task as any);
    return this.taskService.mapPrismaTaskToGrpcTask(newTask);
  }

  @GrpcMethod('TaskService')
  async listTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const pageSize = request.pageSize || 10;
    const pageToken = request.pageToken || '';

    const tasks = await this.taskService.findAll(pageSize, pageToken);

    return ListTasksResponse.create({
      tasks: tasks.items.map((task) =>
        this.taskService.mapPrismaTaskToGrpcTask(task),
      ),
      nextPageToken: tasks.nextPageToken,
    });
  }

  @GrpcMethod('TaskService')
  async getTask(request: GetTaskRequest): Promise<Task> {
    if (!request.name) {
      throw new RpcException({ code: 400, message: 'missing task id' });
    }

    const task = await this.taskService.findById(parseInt(request.name));
    return Task.create(this.taskService.mapPrismaTaskToGrpcTask(task));
  }

  @GrpcMethod('TaskService')
  async updateTask(request: UpdateTaskRequest): Promise<Task> {
    if (!request.task.id) {
      throw new RpcException({ code: 400, message: 'missing task id' });
    }

    const updatedTask = await this.taskService.update(
      request.task.id,
      request.task as any,
    );
    return Task.create(this.taskService.mapPrismaTaskToGrpcTask(updatedTask));
  }

  @GrpcMethod('TaskService')
  async deleteTask(request: DeleteTaskRequest): Promise<Task> {
    if (!request.name) {
      throw new RpcException({ code: 400, message: 'missing params' });
    }

    const deletedTask = await this.taskService.remove(parseInt(request.name));
    return Task.create(this.taskService.mapPrismaTaskToGrpcTask(deletedTask));
  }
}
