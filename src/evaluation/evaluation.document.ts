import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Evaluation {
  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  organizerUserId: string;

  @Prop({ required: true })
  providerId: string;

  @Prop({ required: true, min: 0, max: 5 })
  score: number;
}

export type EvaluationDocument = HydratedDocument<Evaluation>;
export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
