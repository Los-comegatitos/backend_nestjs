import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ServiceSchema, Service } from 'src/service/service.document';
import { TaskSchema, Task } from 'src/task/task.document';

//schema principal event ahora sí
@Schema()
export class Event {
  @Prop()
  eventId: string;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  eventDate: Date;
  @Prop({ default: Date.now })
  creationDate: Date;
  @Prop()
  eventTypeId: string;
  @Prop()
  organizerUserId: string;
  @Prop()
  status: 'in progress' | 'finalized' | 'canceled';
  @Prop({ type: Object })
  client: {
    name: string;
    clientTypeId: string;
    description: string | null;
  };
  @Prop([ServiceSchema])
  services: Types.DocumentArray<Service>;
  @Prop([TaskSchema])
  tasks: Types.DocumentArray<Task>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
export type EventDocument = HydratedDocument<Event>;
