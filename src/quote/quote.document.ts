import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuoteDocument = HydratedDocument<Quote>;

// service anidado SOLO para quote
@Schema()
export class Service {
  @Prop()
  serviceTypeId: string;
  @Prop()
  name: string;
  @Prop()
  description: string;
}

const ServiceSchema = SchemaFactory.createForClass(Service);

@Schema()
export class Event {
  @Prop()
  name: string;
  @Prop()
  organizerId: number;
}

const EventSchema = SchemaFactory.createForClass(Event);

// Este es el quote en sí, no confundir con quotes que va anidado en Event.
@Schema()
export class Quote {
  @Prop()
  id: number;
  @Prop()
  date: Date;
  @Prop()
  quantity: number;
  @Prop()
  price: number;
  @Prop()
  eventId: number;
  @Prop({ type: String })
  toServiceId: string;
  @Prop()
  providerId: number;
  @Prop([ServiceSchema])
  service: Service;
  @Prop([EventSchema])
  event: Event;
  @Prop()
  status: string; // considerar luego enums?
}

export const QuoteShema = SchemaFactory.createForClass(Quote);
