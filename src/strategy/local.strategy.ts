import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      usernameField: 'login',
      passwordField: 'password',
    });
  }

  async validate(login: string, password: string): Promise<Partial<any>> {
    const { user, error, message } = await this.userService.validateUser(
      login,
      password,
    );

    if (!user && error) {
      throw new UnauthorizedException(message);
    }

    return user;
  }
}
