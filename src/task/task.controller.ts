import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
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
    const newTask = data.task;

    return this.taskService.create(newTask as any);
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

    console.log({ res });

    return res;
  }

  @GrpcMethod('TaskService')
  async GetTask(data: GetTaskRequest) {
    const taskId = data.id;

    return this.taskService.findById(taskId);
  }

  @GrpcMethod('TaskService')
  async UpdateTaskRequest(data: UpdateTaskRequest) {
    const taskId = data.task.id;

    const statusLookup = {
      [StatusEnum.TODO]: Status.todo,
      [StatusEnum.DOING]: Status.doing,
      [StatusEnum.DONE]: Status.done,
    };

    const task = new UpdateTaskDto({
      title: data.task.title,
      description: data.task.description,
      dueDate: new Date(data.task.status),
      status: statusLookup[data.task.status] || Status.todo,
    })

    return this.taskService.update(taskId, task);
  }

  async DeleteTaskRequest(data: DeleteTaskRequest) {
    return this.taskService.remove(data.id);
  }
}
