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
    const newTask = data.task;

    if(!newTask.title || !newTask.description || !newTask.status || !newTask.dueDate) {
      throw new RpcException('Task is not valid, missing fields');
    }

    return this.taskService.create(newTask as any);
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    console.log({ tasks });

    if(!tasks) {
      throw new RpcException('No tasks found');
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
    const task = data.task;

    if(!task.id) {
      throw new RpcException('Task is not valid, missing fields');
    }

    return this.taskService.update(task.id, task as any);
  }

  @GrpcMethod('TaskService')
  deleteTask(data: DeleteTaskRequest) {
    const id = data.id;

    if(!id) {
      throw new RpcException('Task not found or invalid id');
    }

    return this.taskService.remove(id);
  }
  
  @GrpcMethod('TaskService')
  getTask(data: GetTaskRequest) {
    const id = data.id;

    if(!id) {
      throw new RpcException('Task not found or invalid id');
    }

    return this.taskService.findById(id);
  }
}
