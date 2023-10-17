import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { jwtConstantsAccess } from '../constants';
import { compare, hash } from 'bcryptjs';
import { decode } from 'jsonwebtoken';
import _ from 'lodash';
import { UserModel } from '../models/user.model';
import {
  RegisterUserDto,
  UserAfterTokenDto,
  UserRoleDto,
} from '../dto/UserDto.dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const res = await this.userModel.findOne({ login: 'admin' });

      if (!res) {
        const newAdmin = {
          login: 'admin',
          password:
            '$2a$05$kCaZJFR4ByBVuvUaxIMGzeetzu3v8zDaHRffH0/6YMz5829soXH9.',
          role: 'ADMINISTRATOR',
        };
        await this.userModel.create(newAdmin);
      }
    } catch (error) {
      throw error;
    }
  }

  async validateUser(login: string, password: string) {
    const user: any = await this.findUser(login);
    if (user?.password) {
      const isEqual = await compare(password, user.password);
      if (isEqual) return { user: user };

      return { error: true, message: 'Incorrect login or password' };
    }

    return { error: true, message: 'Incorrect login or password' };
  }

  async login(body: UserAfterTokenDto) {
    const payload = {
      login: body.login,
      role: body.role,
    };

    return {
      access_token: this.jwtService.sign(payload, jwtConstantsAccess),
    };
  }

  async register(body: RegisterUserDto) {
    try {
      const { login, password } = body;
      if (!login || !password) {
        return { error: true, message: 'Incorrect login or password' };
      }
      const candidate = await this.userModel.findOne({ login: login });
      if (candidate) {
        return { error: true, message: 'User already exist' };
      }
      body.password = await hash(password, 2);
      const newUser = await this.userModel.create(body);
      const payload = {
        login: body.login,
        role: newUser.role,
      };

      return {
        access_token: this.jwtService.sign(payload, jwtConstantsAccess),
      };
    } catch (e) {
      console.log(e);
    }
  }
  public async findUser(login: string) {
    return await this.userModel.findOne({ login: login }).select('-password');
  }

  public async findByToken(token: string) {
    const decoded: any = decode(token);

    if (decoded) {
      return _.pick(decoded, ['login']);
    } else return null;
  }

  public async getAllUsers(user: UserAfterTokenDto) {
    try {
      const { role, login } = user;

      switch (role) {
        case UserRoleDto.ADMINISTRATOR:
          const users = await this.userModel.find().select('-password');
          return { users: users };
        case UserRoleDto.BOSS:
          const boss = await this.findUser(login);
          const subordinates = await this.userModel
            .find({ boss: boss._id })
            .select('-password');
          return { user: boss, subordinates: subordinates };
        case UserRoleDto.USER:
          const regUser = await this.findUser(login);
          return { user: regUser };
      }
    } catch (e) {
      console.log(e);
      return Error('Error with get users');
    }
  }

  public async changeBoss(bossLogin: string, id: string, newBossLogin: string) {
    try {
      if (!bossLogin || !id || !newBossLogin) {
        return {
          error: true,
          message: 'Incorrect boss or id which needed new boss',
        };
      }

      const oldBoss = await this.userModel.findOne({ login: bossLogin });

      if (!oldBoss) {
        return { error: true, message: "Old boss doesn't exist" };
      }

      const user = await this.userModel.findOne({ _id: id, boss: oldBoss._id });

      if (!user) {
        return { error: true, message: "User or old boss doesn't exist" };
      }

      const newBoss = await this.userModel.findOne({ login: newBossLogin });

      if (!newBoss) {
        return { error: true, message: "New boss doesn't exist" };
      }

      return await this.userModel.updateOne(
        { _id: id, boss: oldBoss._id },
        { boss: newBoss._id },
      );
    } catch (e) {
      console.log(e);
      return Error('Something going wrong');
    }
  }
}
