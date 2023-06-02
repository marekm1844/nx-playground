import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from "../../../shared/events/infarstructure/redis-queue.module";

@Module({
    imports: [ConfigModule, QueueModule],
    providers: [],
    exports: [],
})
export class BullmqModule {}