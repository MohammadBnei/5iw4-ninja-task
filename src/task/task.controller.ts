import { Body, Controller, UsePipes } from '@nestjs/common';
import { TaskService } from './task.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  ListTasksResponse,
  UpdateTaskRequest,
} from 'src/stubs/task/v1alpha/task';
import { MapperService } from 'src/mapper/mapper.service';
import { JoiValidationPipe } from 'src/joi-validation/joi-validation.pipe';
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from 'src/joi-validation/joi-objectSchemas';

@Controller()
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly mapperService: MapperService,
  ) {}

  @GrpcMethod('TaskService')
  @UsePipes(new JoiValidationPipe(createTaskSchema))
  async createTask(@Body() data: CreateTaskRequest) {
    return this.mapperService.toGrpcTask(
      await this.taskService.create(this.mapperService.toPrismaTask(data.task)),
    );
  }

  @GrpcMethod('TaskService')
  async ListTasks(): Promise<ListTasksResponse> {
    const tasks = await this.taskService.findAll();
    const res = ListTasksResponse.create({
      tasks: tasks.map((t) => this.mapperService.toGrpcTask(t)),
    });

    return res;
  }

  @GrpcMethod('TaskService')
  @UsePipes(new JoiValidationPipe(taskIdSchema))
  async GetTask(@Body() req: GetTaskRequest) {
    return this.mapperService.toGrpcTask(
      await this.taskService.findById(
        this.mapperService.toPrismaTaskId(req.name),
      ),
    );
  }

  @GrpcMethod('TaskService')
  @UsePipes(new JoiValidationPipe(updateTaskSchema))
  async updateTask(@Body() req: UpdateTaskRequest) {
    const taskToUpdate = req.task;
    return this.mapperService.toGrpcTask(
      await this.taskService.update(
        taskToUpdate.id,
        this.mapperService.toPrismaTask(taskToUpdate),
      ),
    );
  }

  @GrpcMethod('TaskService')
  @UsePipes(new JoiValidationPipe(taskIdSchema))
  async deleteTask(@Body() req: DeleteTaskRequest) {
    return this.mapperService.toGrpcTask(
      await this.taskService.remove(
        this.mapperService.toPrismaTaskId(req.name),
      ),
    );
  }
}
