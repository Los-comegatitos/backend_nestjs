import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // lógica copiada de por ahí para tener mejor detalles del error antes de volverme loca.
    const request = ctx.getRequest<Request>();
    console.log('=== VALIDATION ERROR ===');
    console.log('Endpoint:', request.method, request.url);
    console.log('Body:', JSON.stringify(request.body, null, 2));
    console.log('Params:', JSON.stringify(request.params, null, 2));
    console.log('Query:', JSON.stringify(request.query, null, 2));
    console.log('Exception:', exception);
    console.log('========================');

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
