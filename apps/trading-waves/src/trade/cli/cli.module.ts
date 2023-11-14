import { Module } from '@nestjs/common';
import { CreateOrderServiceCLI } from './create-order.service';

@Module({
  providers: [CreateOrderServiceCLI],
})
export class CliModule {}
