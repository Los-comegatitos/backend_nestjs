import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatalogDocument = HydratedDocument<Catalog>;

@Schema()
export class Catalog {
  @Prop()
  id: number;
  @Prop()
  description: string;
  @Prop(
    raw([
      {
        serviceTypeId: { type: Number },
        name: { type: String },
        description: { type: String },
        quantity: { type: Number },
      },
    ]),
  )
  services: Array<Record<string, any>>;
}

export const CatalogSchema = SchemaFactory.createForClass(Catalog);
