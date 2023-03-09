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
import { NotFoundError } from 'rxjs';

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
  async GetTask(request: GetTaskRequest): Promise<Task> {
    const task = await this.taskService.findById(request.id);

    return Task.create({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: Status[task.status],
    });
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<any> {
    try {
      const updatedTask = request.task;
      const task = await this.taskService.findById(updatedTask.id);

      if (task) {
        const task = await this.taskService.update(
          updatedTask.id,
          updatedTask as any,
        );

        return Task.create({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate.toISOString(),
          status: Status[task.status],
        });
      } else {
        throw new RpcException("Task doesn't exist");
      }
    } catch (error) {
      console.log(error.response.message);
      return { error: error.response.message };
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: GetTaskRequest): Promise<any> {
    try {
      const task = await this.taskService.findById(request.id);

      if (task) {
        await this.taskService.remove(request.id);

        return { message: 'Task deleted successfully' };
      } else {
        throw new RpcException("Task doesn't exist");
      }
    } catch (error) {
      console.log(error.response.message);
      return { error: error.response.message };
    }
  }
}
