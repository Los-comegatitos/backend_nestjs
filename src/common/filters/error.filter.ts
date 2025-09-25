import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Para que vean la info en la consola ya que el handler se está volando info pero anyways esto no debemos mostrárselo al usuario de todas maneras.
    console.log('exceptioooooooon', exception);

    // Verifica que sea http exception para obtener status y message y sino no pues error interno por ahora
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    response.status(status).json({
      data: null,
      message: {
        code: status.toString(),
        description: message,
      },
    });
  }
}
