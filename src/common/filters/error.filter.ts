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
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let messageDescription = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const responseBody = exception.getResponse();
      if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const msg = (responseBody as any).message;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        messageDescription = Array.isArray(msg) ? msg.join(', ') : msg;
      } else {
        messageDescription = exception.message;
      }
    }

    response.status(status).json({
      data: null,
      message: {
        code: status.toString(),
        description: messageDescription,
      },
    });
  }
}
