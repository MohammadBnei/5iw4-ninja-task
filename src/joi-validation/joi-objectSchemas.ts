import Joi from 'joi';
import {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  Status,
  Task,
  UpdateTaskRequest,
} from 'src/stubs/task/v1alpha/task';

export const createTaskSchema = Joi.object<CreateTaskRequest>({
  parent: Joi.required(),
  taskId: Joi.required(),
  task: Joi.object<Task>({
    id: Joi.number(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date().required(),
    status: Joi.string()
      .valid(Status.TODO, Status.DOING, Status.DONE)
      .required(),
  }).required(),
});

export const updateTaskSchema = Joi.object<UpdateTaskRequest>({
  task: Joi.object<Task>({
    id: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date().required(),
    status: Joi.string()
      .valid(Status.TODO, Status.DOING, Status.DONE)
      .required(),
  }).required(),
});

export const taskIdSchema = Joi.object<GetTaskRequest | DeleteTaskRequest>({
  name: Joi.number().required(),
});
