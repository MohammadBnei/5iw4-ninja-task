import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Status,
  Task,
  DeleteTaskRequest,
  UpdateTaskRequest,
  GetTaskRequest,
} from 'src/stubs/task/v1alpha/task';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  createTask(data: CreateTaskRequest) {
    if (
      !data.task.title ||
      !data.task.description ||
      !data.task.dueDate ||
      !data.task.status
    ) {
      throw new RpcException({
        code: 400,
        message: 'The task title, description, dueDate or Status is missing',
      });
    }
    const newTask = data.task;

    return this.taskService.create(newTask as any);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    console.log({ tasks });

    if(!tasks) {
      throw new RpcException({
        code: 404,
        message: 'No tasks were found',
      });
    }

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
    
    if (
      !data.task.title ||
      !data.task.description ||
      !data.task.dueDate ||
      !data.task.status
    ) {
      throw new RpcException({
        code: 400,
        message: 'The task title, description, dueDate or Status is missing',
      });
    }

    const task = data.task;

    return this.taskService.update(task.id, task as any);
  }

  @GrpcMethod('TaskService')
  deleteTask(data: DeleteTaskRequest) {
    const id = data.id;

    if (!id) {
      throw new RpcException({
        code: 404,
        message: 'The task id is missing or not found',
      });
    }

    return this.taskService.remove(id);
  }
  
  @GrpcMethod('TaskService')
  getTask(data: GetTaskRequest) {
    const id = data.id;

    if (!id) {
      throw new RpcException({
        code: 404,
        message: 'The task was not found',
      });
    }

    return this.taskService.remove(id);
  }
}
