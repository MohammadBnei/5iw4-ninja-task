import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod, RcpException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  UpdateTaskRequest,
  DeleteTaskRequest,
  Status,
  Task,
} from 'src/stubs/task/v1alpha/task';

// Wendy AFRIM
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  createTask(data: CreateTaskRequest) {

    try {
      const newTask = data.task;
      return this.taskService.create(newTask as any);

    } catch (error) {
      throw new RcpException(error);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<ListTasksResponse> {
  
    if(!request.name) {
      throw new RcpException({
        code: 500, 
        message: 'Task name must be provided'
      })
    }

    const task = this.taskService.findByName(request.name);

    return task;
  }


  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();

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
  async EditTask(request: UpdateTaskRequest): Promise<ListTasksResponse> {

    if(!request.task.id) {
      throw new RcpException({
        code: 500, 
        message: 'Task id must be provided'
      })
    }

    const task = await this.taskService.update(request.task.id, {
      title: request.task.title,
      description: request.task.description,
      status: request.task.status,
      dueDate: request.task.dueDate,

    });

    return task;
  }


  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<ListTasksResponse> {

    if(!request.name) {
      throw new RcpException({
        code: 500, 
        message: 'Task name must be provided'
      })
    }

    const task = await this.taskService.findByName(request.name);
    this.taskService.remove(task.id);

    return task;
  }
}
