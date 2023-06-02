import { Queue } from "bullmq";
import { Module } from "@nestjs/common";
import { BullMqQueueService } from "../../../shared/events/infarstructure/bullmq-queue.service";
import { IQueueService } from "../../../shared/events/queue-service.interface";
import { EventPublisher } from "../../../shared/events/event.publisher";
import { WAVE_ANALYZER_EVENT_PUBLISHER, WAVE_ANALYZER_QUEUE, WAVE_ANALYZER_QUEUE_SERVICE } from "./bullmq.constants";
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from "../../../shared/events/infarstructure/redis-queue.module";

@Module({
    imports: [ConfigModule, QueueModule],
    providers: [],
    exports: [],
})
export class BullmqModule {}