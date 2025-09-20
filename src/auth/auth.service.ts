import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const isValid = await compare(password, user.password);
    if (isValid) {
      const payload = {
        email: email,
        typeuser: user.typeuser.name, 
      };
      return { token: await this.jwtService.signAsync(payload) };
    }

    throw new UnauthorizedException('Invalid password');
  }

  async registerUser(user: User) {
    return await this.usersService.create(user);
  }
}
