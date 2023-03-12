import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  UpdateTaskRequest,
  GetTaskRequest,
  Status,
  Task,
  DeleteTaskRequest,
} from 'src/stubs/task/v1alpha/task';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @GrpcMethod('TaskService', 'CreateTask')
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
          status: Status[t.status],
          description: t.description,
        }),
      ),
    });

    console.log({ res });

    return res;
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest) {
    const task = request.task;
    return this.taskService.update(request.task.id, task as any);
  }


  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest) {
    const id = Number(request.name);
    return this.taskService.findOne(id)
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest) {
    const id = Number(request.name);
    return this.taskService.remove(id);
  }




  // @GrpcMethod('TaskService')
  // async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
  //   const task = await this.taskService.update(request.id, request.task);

  //   return Task.create({
  //     title: task.title,
  //   });
  // }

}
