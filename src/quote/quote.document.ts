import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuoteDocument = HydratedDocument<Quote>;

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
  @Prop()
  toServiceId: number;
  @Prop()
  providerId: number;
  @Prop(
    raw({
      serviceTypeId: { type: Number },
      name: { type: String },
      description: { type: String },
    }),
  )
  service: Record<string, any>;
  @Prop()
  status: string;
}

export const QuoteShema = SchemaFactory.createForClass(Quote);
