import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class GrpcValidationException extends RpcException {
  constructor(message: string) {
    super({
      message,
      code: status.INVALID_ARGUMENT,
    });
  }
}
export class GrpcNotFoundException extends RpcException {
  constructor(message: string) {
    super({
      message,
      code: status.NOT_FOUND,
    });
  }
}

export class GrpcAlreadyExists extends RpcException {
  constructor(message: string) {
    super({
      message,
      code: status.ALREADY_EXISTS,
    });
  }
}

export class GrpcUnknownException extends RpcException {
  constructor(message: string) {
    super({
      message,
      code: status.UNKNOWN,
    });
  }
}
