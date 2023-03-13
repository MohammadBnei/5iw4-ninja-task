//RENOUX Océane 5IW4
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
    // const tasks = await this.taskService.findAll();

    const page_token = Number(request.pageToken);
    const page_size = request.pageSize;
    const tasks = await this.taskService.findPage(  page_size , page_token );

    console.log({ tasks });
    const res = ListTasksResponse.create({
      tasks: tasks.map((t) =>
        Task.create({
          title: t.title,
          status: Status[t.status],
          description: t.description,
        }),
      ),
      nextPageToken: tasks.length > 0 ? tasks[tasks.length - 1].id.toString() : null,
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

}
