import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Definido service aquí, específico para catalog, porque puede que para otras cosas se comporte diferente y aja, no nos vamos a dar mala vida ahora con eso
@Schema()
export class Service {
  @Prop()
  serviceTypeId: string;
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop({ type: Number })
  quantity: number | null;
}

const ServiceSchema = SchemaFactory.createForClass(Service);

@Schema()
export class Catalog {
  @Prop({ required: true })
  providerId: string;
  @Prop()
  description: string;
  @Prop([ServiceSchema])
  services: Service[];
}

export type CatalogDocument = HydratedDocument<Catalog>;

export const CatalogSchema = SchemaFactory.createForClass(Catalog);
