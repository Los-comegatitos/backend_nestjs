import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Validar usuario
  async validateUser(email: string, pass: string) {
    try {
 
      const user = await this.userService.findByEmail(email, { relations: ['typeuser'] });

      if (!user) return null;

      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) return null;

      // Excluir password
      const { password, ...result } = user;
      return result;
    } catch (err) {
      console.error('Error validating user:', err);
      return null;
    }
  }

  // Crear JWT
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.typeuser?.name || 'guest',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
