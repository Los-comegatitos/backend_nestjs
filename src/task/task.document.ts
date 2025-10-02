import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Attachment {
  @Prop()
  id: string;

  @Prop()
  fileName: string;
}
export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

@Schema()
export class Comment {
  @Prop()
  idUser: string;

  @Prop()
  userType: string;

  @Prop()
  date: Date;

  @Prop()
  description: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema()
export class Task {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  creationDate: Date;

  @Prop({ type: Date })
  completionDate: Date | null;

  @Prop()
  reminderDate: Date;

  @Prop()
  dueDate: Date;

  @Prop()
  status: 'pending' | 'completed';

  @Prop([AttachmentSchema])
  attachments: Attachment[];

  @Prop([CommentSchema])
  comments: Comment[];

  @Prop()
  associatedProviderId: string | null;
}
export const TaskSchema = SchemaFactory.createForClass(Task);
