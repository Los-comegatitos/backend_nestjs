import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Service {
  @Prop()
  id: number;
  @Prop()
  name: string;
  @Prop()
  serviceTypeId: number;
  @Prop()
  description: string;
  @Prop()
  quantity: number;
  @Prop(
    raw({
      date: { type: Date },
      quantity: { type: Number },
      price: { type: Number },
      serviceTypeId: { type: Number },
      providerId: { type: Number },
    }),
  )
  quote: Record<string, any>;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
