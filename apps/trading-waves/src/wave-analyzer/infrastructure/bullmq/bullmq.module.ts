import { Queue } from "bullmq";
import { Module } from "@nestjs/common";
import { BullMqQueueService } from "../../../shared/events/infarstructure/bullmq-queue.service";
import { IQueueService } from "../../../shared/events/queue-service.interface";
import { EventPublisher } from "../../../shared/events/event.publisher";
import { WAVE_ANALYZER_EVENT_PUBLISHER, WAVE_ANALYZER_QUEUE, WAVE_ANALYZER_QUEUE_SERVICE } from "./bullmq.constants";
import IORedis from 'ioredis';
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: WAVE_ANALYZER_QUEUE,
            useFactory: (configService: ConfigService) => {
                //INFO! IORedis must be use and not Redis because of the following error: ERR_SSL_WRONG_VERSION_NUMBER
                const redis = new IORedis({
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                    username: configService.get<string>('REDIS_USER'),
                    password: configService.get<string>('REDIS_PASSWORD'),
                    maxRetriesPerRequest: null,
                });
                return new Queue('wave-analyzer-queue', {connection: redis});
            },
            inject: [ConfigService],
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