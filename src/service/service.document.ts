import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// quote anidado
@Schema()
class Quote {
  @Prop()
  date: Date;
  @Prop()
  quantity: number;
  @Prop()
  price: number;
  @Prop()
  serviceTypeId: string;
  @Prop()
  providerId: string;
}
const QuoteSchema = SchemaFactory.createForClass(Quote);

// Servicio que va anidado en event (no confundir con el que va anidado en catalog)
@Schema()
export class Service {
  @Prop()
  dueDate: Date;
  @Prop()
  serviceTypeId: string;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop({ type: Number })
  quantity: number | null;
  @Prop({ type: QuoteSchema, default: null })
  quote: Quote | null;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
