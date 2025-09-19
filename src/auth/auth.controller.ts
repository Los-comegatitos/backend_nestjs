
import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './jwt-strategy/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginAuthDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    }

    const token = await this.authService.login(user);

    return {
      statusCode: 201,
      message: 'Login successful',
      ...token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return {
      statusCode: 200,
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }
}

