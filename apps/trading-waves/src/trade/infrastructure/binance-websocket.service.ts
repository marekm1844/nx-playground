import { Inject, Injectable } from '@nestjs/common';
import Binance from 'binance-api-node';
import { IEventStore } from '../domain/repositories/event-store.interface';
import { EventPublisher } from '@nestjs/cqrs';
import { OrderEventDto } from '../domain/dto/order-event.dto';

@Injectable()
export class BinanceWebsocketService {
  private readonly binanceWsClient;

  constructor(@Inject('BINANCE_API_KEY') apiKey: string, @Inject('BINANCE_SECRET_KEY') secretKey: string, private eventStore: IEventStore, private publisher: EventPublisher) {
    this.binanceWsClient = Binance({
      apiKey: apiKey,
      apiSecret: secretKey,
    }).ws;
  }

  // listedForOrderUpates(orderId: string) {
  //   const stream =
  //   this.binanceWsClient.userData( (event) => {
  //       if (event.eventType === 'executionReport' && event.orderId === orderId) {
  //           this.publisher.mergeObjectContext(
  //             new OrderEventDto(orderId, event.orderStatus)
  //           );
  //         }
  //       },
  //       // Handle errors here
  //     );
  //       const orderUpdatedEvent = this.publisher.mergeObjectContext(new OrderEventDto(this.mapBinanceResponseToOrderEventDto(msg)));

  //       this.eventStore.save(orderUpdatedEvent);
  //       orderUpdatedEvent.commit();
  //     }
  //   });
  // }
}
