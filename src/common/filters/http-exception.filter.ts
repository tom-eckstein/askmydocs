import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/error-response.interface';
import { formatEnumName } from '../utils/format-enum-name.util';
import { ZodError } from 'zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let message: string;
    let error: string;
    let details: unknown;

    if (exception instanceof TypeError) {
      this.logger.error(exception.message, exception.stack);
      statusCode = HttpStatus.BAD_GATEWAY;
      message =
        'Connection to the partner service failed. Please try again later.';
      error = formatEnumName(HttpStatus[statusCode]);
    } else if (exception instanceof ZodError) {
      this.logger.error(exception.message, exception.stack);
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = formatEnumName(HttpStatus[statusCode]);
      details = exception.issues.map((el) => ({
        field: el.path[0],
        message: el.message,
      }));
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      error = formatEnumName(HttpStatus[statusCode]);
      details = exception.cause ?? null;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      error = 'Internal Server Error';
      if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.error('An unknown error occurred', String(exception));
      }
    }

    const responseBody: ErrorResponse = {
      statusCode,
      message,
      error,
    };
    if (details !== undefined) {
      responseBody.details = details;
    }

    response.status(statusCode).json(responseBody);
  }
}
