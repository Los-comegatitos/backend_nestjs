import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';


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

  @Get('profile')
  getProfile(@Request() req: any) {
    const { password, ...userWithoutPassword } = req.user;
    return {
      statusCode: 200,
      message: 'Profile retrieved successfully',
      user: userWithoutPassword,
    };
  }


}