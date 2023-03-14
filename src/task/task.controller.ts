import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateTaskDto } from './dto/create-task.dto';
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
    if (!data.task) {
      throw new RpcException({ code: 400, message: 'Task required' });
    }
    if (!(data.task.title && data.task.description)) {
      throw new RpcException({ code: 400, message: 'Task requires title, description, dueDate' });
    }
    const t: CreateTaskDto = {
      title: data.task.title,
      description: data.task.description,
      dueDate: data.task.dueDate ?? new Date().toISOString(),
      status: OtherStatus.todo,
    };
    
    return this.taskService.create(t);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    if (!tasks) {
      throw new RpcException({ code: 404, message: 'No tasks found' });

    }
    const res = ListTasksResponse.create({
      tasks: tasks.map((t) =>
        Task.create({
          id: t.id,
          title: t.title
        })
      )
    });
    return res;
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    if (!request.id)
      throw new RpcException({ code: 400, message: 'Task id is required' });

    const task = await this.taskService.findById(request.id);

    if (!task)
      throw new RpcException({ code: 404, message: "Task doesn't exist" });

    const { title, description, dueDate, status } = task;

    return Task.create({
      title,
      description,
      dueDate: dueDate.toISOString(),
      status: Status[status],
    });
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    if (!request.task)
      throw new RpcException({ code: 400, message: 'Task is required' });

    if (!(request.task.id && typeof request.task.id == 'number'))
      throw new RpcException({ code: 400, message: 'Task id is required' });

    const t = request.task;

    if (t.status == Status.TODO)
      t.status = OtherStatus.todo as any;
    else if (t.status == Status.DOING)
      t.status = OtherStatus.doing as any;
    else if (t.status == Status.DONE)
      t.status = OtherStatus.done as any;

    const task = await this.taskService.update(t.id, t as any);

    if (!task)
      throw new RpcException({ code: 404, message: "Task doesn't exist" });

    const { title, description, dueDate, status } = task;

    return Task.create({
      title,
      description,
      dueDate: dueDate.toISOString(),
      status: Status[status],
    });
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: GetTaskRequest): Promise<any> {
    if (!request.id)
      throw new RpcException({ code: 400, message: 'Task requires id' });

    const task = await this.taskService.findById(request.id);

    if (!task)
      throw new RpcException({ code: 404, message: "Task doesn't exist" });

    await this.taskService.remove(request.id);

    return { message: 'Task deleted' };
  }
}