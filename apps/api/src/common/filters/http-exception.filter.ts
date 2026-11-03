import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

import { Prisma } from "../../generated/prisma/client.js";

type ErrorBody = { statusCode: number; message: string | string[]; error: string };

/** Uniform `{ statusCode, message, error }` responses; maps common Prisma errors. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);
    if (body.statusCode >= 500) this.logger.error(exception);
    res.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const r = exception.getResponse();
      const message =
        typeof r === "object" && r !== null && "message" in r
          ? (r as { message: string | string[] }).message
          : exception.message;
      return { statusCode: status, message, error: HttpStatus[status] ?? "Error" };
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        return {
          statusCode: 409,
          message: "That value is already in use (must be unique).",
          error: "Conflict",
        };
      }
      if (exception.code === "P2025") {
        return { statusCode: 404, message: "Not found", error: "Not Found" };
      }
      if (exception.code === "P2003") {
        return {
          statusCode: 400,
          message: "A linked record does not exist.",
          error: "Bad Request",
        };
      }
    }
    return { statusCode: 500, message: "Internal server error", error: "Internal Server Error" };
  }
}
