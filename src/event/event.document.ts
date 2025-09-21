import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Service } from 'src/service/service.document';
import { Task } from 'src/task/task.document';

@Schema()
export class Event {
  @Prop()
  id: number;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  eventDate: Date;
  @Prop()
  creationDate: Date;
  @Prop()
  eventTypeId: number;
  @Prop()
  organizerUserId: number;
  @Prop(
    raw({
      name: { type: String },
      clientTypeId: { type: Number },
      description: { type: String },
    }),
  )
  client: Record<string, any>;
  @Prop([Service])
  services: Service[];
  @Prop([Task])
  tasks: Task[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

export type EventDocumentOverride = {
  name: Types.DocumentArray<Service>;
};

export type EventDocumentOverride2 = {
  name: Types.DocumentArray<Task>;
};

export type EventDocument = HydratedDocument<
  Event,
  EventDocumentOverride,
  EventDocumentOverride2
>;
