import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IUser } from '../interfaces/admin.interface';
import mongoose from 'mongoose';

@Schema({ collection: 'User', timestamps: true })
export class UserModel extends Document implements IUser {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: ['USER', 'BOSS', 'ADMINISTRATOR'],
    default: 'USER',
  })
  role: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  boss: string;
}
export const UserSchema = SchemaFactory.createForClass(UserModel);
