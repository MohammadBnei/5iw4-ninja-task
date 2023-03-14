import {
    BadRequestException,
    NotFoundException,
    Logger
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

export const handlePrismaError = (error: PrismaClientKnownRequestError, entityName: string, id: number) => {
    Logger.error('error code', error)
    switch (error.code) {
        case "P2025":
            return new NotFoundException(`${entityName} with id ${id} not found`);
        case "P2002":
            return new NotFoundException(`${entityName} with id ${id} not found`);
        case "P2003":
            return new BadRequestException(error.message);
        case "P2005":
            return new BadRequestException(error.message);
        default:
            return new BadRequestException('Unhandled error message: ', error.message);
    }
}