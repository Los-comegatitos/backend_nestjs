import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';


export class LoginBody {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: LoginBody) {
    return await this.authService.login(body.email, body.password);
  }

  @Post('/register')
  async registerUser(@Body() body: User) {
    return await this.authService.registerUser(body);
  }
}
