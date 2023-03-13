import { Catch, BadRequestException } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";
import { Observable, throwError } from "rxjs";
import { HttpAdapterHost } from "@nestjs/core";

@Catch(RpcException, BadRequestException){
    export class BadRequestExceptionFilter implements BaseRpcExceptionFilter<RpcException> {
        catch(exception: BadRequestException | RpcException, host: HttpAdapterHost): Observable<any> {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse();

            if (exception instanceof RpcException){
                return throwError(exception);
            }

            return throwError({
                statusCode: exception.getStatus(),
                message: exception.message,
                error: 'Bad Request'
            });
        }
    }
}