import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomizeException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode: status,
        data: [],
        message: message,
      },
      status,
    );
  }
}
