import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';

@Module({
  providers: [EvaluationService],
  controllers: [EvaluationController]
})
export class EvaluationModule {}
