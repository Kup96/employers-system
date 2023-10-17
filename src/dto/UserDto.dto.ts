import { IsNotEmpty } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  password: string;
}

export class UserAfterTokenDto {
  login: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AccessTokenDto {
  access_token: string;
}

export enum UserRoleDto {
  ADMINISTRATOR = 'ADMINISTRATOR',
  USER = 'USER',
  BOSS = 'BOSS',
}
