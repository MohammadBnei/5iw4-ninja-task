// Jérémy JUMPERTZ 5IW4
import { Controller, UseFilters } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Status,
  Task,
} from 'src/stubs/task/v1alpha/task';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';
import { ConflictExceptionFilter } from './filters/conflict-exception.filter';
import { BadRequestExceptionFilter } from './filters/bad-request-exception.filter';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  @UseFilters(
    new NotFoundExceptionFilter(),
    new BadRequestExceptionFilter(),
    new ConflictExceptionFilter(),
  )
  createTask(data: CreateTaskRequest) {
    const newTask = data.task;

    return this.taskService.create(newTask as any);
  }
  @GrpcMethod('TaskService')
  @UseFilters(
    new NotFoundExceptionFilter(),
    new BadRequestExceptionFilter(),
    new ConflictExceptionFilter(),
  )
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
  @UseFilters(new NotFoundExceptionFilter(), new BadRequestExceptionFilter())
  async findTaskById(data: { id: number }) {
    const task = await this.taskService.findById(data.id);
    return Task.create({
      title: task.title,
    });
  }

  @GrpcMethod('TaskService')
  @UseFilters(new NotFoundExceptionFilter(), new BadRequestExceptionFilter())
  async updateTask(data: { id: number; task: any }) {
    const updatedTask = await this.taskService.update(data.id, data.task);
    return Task.create({
      title: updatedTask.title,
    });
  }

  @GrpcMethod('TaskService')
  @UseFilters(new NotFoundExceptionFilter(), new BadRequestExceptionFilter())
  async deleteTask(data: { id: number }): Promise<Status> {
    const task = await this.taskService.findById(data.id);

    if (!task) {
      throw new NotFoundException(`Task with id ${data.id} not found`);
    }

    await this.taskService.remove(data.id);

    return Status.create({
      message: 'Task deleted successfully',
    });
  }
}
