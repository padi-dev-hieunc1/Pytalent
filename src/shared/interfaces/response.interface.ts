import { HttpStatus } from '@nestjs/common';

export interface ResponseInterface {
  data?: object;
  message?: string;
}

export interface ApiResponseInterface extends ResponseInterface {
  status: boolean;
  httpStatus: HttpStatus;
}
