import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Task {
  @Prop()
  id: number;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  creationDate: Date;
  @Prop()
  completitionDate: Date;
  @Prop()
  reminderDate: Date;
  @Prop()
  dueDate: Date;
  @Prop()
  status: string;
  @Prop(
    raw([
      {
        id: { type: Number },
        fileName: { type: String },
      },
    ]),
  )
  attachments: Array<Record<string, any>>;
  @Prop(
    raw([
      {
        idUser: { type: Number },
        userType: { type: String },
        date: { type: Date },
        description: { type: String },
      },
    ]),
  )
  comments: Array<Record<string, any>>;
  @Prop()
  associatedProviderId: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
