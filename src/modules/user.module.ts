import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers/user.controller';
import { JwtService } from '@nestjs/jwt';
import { LocalStrategy } from '../strategy/local.strategy';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { UserModel, UserSchema } from '../models/user.model';
import { UserService } from '../services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [UserService, JwtService, LocalStrategy, JwtStrategy],
  controllers: [UserController],
})
export class UserModule {}
