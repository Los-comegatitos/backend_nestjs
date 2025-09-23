import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop()
  id: number;
  @Prop()
  toUserId: number;
  @Prop()
  date: Date;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
