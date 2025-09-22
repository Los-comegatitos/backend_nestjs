import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Req() req: Request & { user: UserPayload }) {
    return req.user;
  }
}
