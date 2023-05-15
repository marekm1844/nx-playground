import { Queue } from "bullmq";
import { Module } from "@nestjs/common";
import { BullMqQueueService } from "../../../shared/events/infarstructure/bullmq-queue.service";
import { IQueueService } from "../../../shared/events/queue-service.interface";
import { EventPublisher } from "../../../shared/events/event.publisher";
import { WAVE_ANALYZER_EVENT_PUBLISHER, WAVE_ANALYZER_QUEUE, WAVE_ANALYZER_QUEUE_SERVICE } from "./bullmq.constants";
import Redis from 'ioredis-mock';

@Module({
    providers: [
        {
            provide: WAVE_ANALYZER_QUEUE,
            useFactory: () => {
                const mockRedis = new Redis();
                return new Queue('wave-analyzer-queue', {connection: mockRedis});
            },
        },
        {
            provide: WAVE_ANALYZER_QUEUE_SERVICE,
            useFactory: (queue: Queue) => new BullMqQueueService(queue),
            inject: [WAVE_ANALYZER_QUEUE],
        },
        {
            provide: WAVE_ANALYZER_EVENT_PUBLISHER,
            useFactory: (queueService: IQueueService) =>  new EventPublisher(queueService),
            inject: [WAVE_ANALYZER_QUEUE_SERVICE],
        }
    ],
    exports: [WAVE_ANALYZER_QUEUE, WAVE_ANALYZER_QUEUE_SERVICE, WAVE_ANALYZER_EVENT_PUBLISHER],
})
export class BullmqModule {}