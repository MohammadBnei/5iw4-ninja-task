import { Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class ConflictExceptionFilter
  implements BaseRpcExceptionFilter<RpcException>
{
  catch(exception: RpcException): Observable<any> {
    return throwError(exception.getError());
  }

  handleUnknownError(error: any): Observable<any> {
    return throwError(error);
  }

  isError(error: any): boolean {
    return error instanceof RpcException;
  }
}
