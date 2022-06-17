import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): any => {
    const req: Request = context.switchToHttp().getRequest();
    if (!data) return req.user;
    return req.user[data];
  },
);
