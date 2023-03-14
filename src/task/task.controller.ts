/**
 *  Antoine LIN
 *  5IW4
 */

import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import {GrpcMethod, RpcException} from '@nestjs/microservices';
import { Status } from '@prisma/client';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  GetTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
  Status as StatusEnum,
  Task,
} from 'src/stubs/task/v1alpha/task';
import {UpdateTaskDto} from "./dto/update-task.dto";

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService')
  async CreateTask(data: CreateTaskRequest) {
    try {
      if (!data.task.title || !data.task.description || !data.task.dueDate) {
        throw new RpcException('Task title, description and dueDate are required');
      }

      data.task.dueDate = new Date(data.task.dueDate).toISOString()

      return await this.taskService.create(data.task as any);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException('An error occurred while creating the task');
    }
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
  async GetTask(data: GetTaskRequest) {
    try {
      const taskId = data.id;

      const task = this.taskService.findById(taskId);

      if (!task) {
        throw new RpcException(`Task with ID ${taskId} not found`);
      }

      return task
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException('An error occurred while getting the task');
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(data: UpdateTaskRequest) {
    try {
      if (!data.task.id) {
        throw new RpcException('Task id is required');
      }

      const taskId = data.task.id;

      const statusLookup = {
        [StatusEnum.TODO]: Status.todo,
        [StatusEnum.DOING]: Status.doing,
        [StatusEnum.DONE]: Status.done,
      };

      data.task.dueDate = new Date(data.task.dueDate).toISOString()
      data.task.status = (statusLookup[data.task.status] || Status.todo) as any

      const updatedTask = await this.taskService.update(taskId, data.task as any);

      if (!updatedTask) {
        throw new RpcException(`Task with ID ${taskId} not found`);
      }

      return updatedTask;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException('An error occurred while updating the task');
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(data: DeleteTaskRequest) {
    try {
      if (!data.id) {
        throw new RpcException('Task id is required');
      }

      return this.taskService.remove(data.id);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException('An error occurred while deleting the task');
    }
  }
}
