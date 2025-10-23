import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop()
  id: number;
  @Prop()
  toUserEmail: string;
  @Prop()
  date: Date;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  status: string;
  @Prop()
  url: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
