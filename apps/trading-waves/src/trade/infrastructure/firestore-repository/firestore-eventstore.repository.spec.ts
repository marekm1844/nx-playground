import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreEventStore } from './firestore-eventstore.repository';
import { FirestoreClient } from '../../../shared/repository/firestore.client';
import { Order } from '../../domain/order.aggregate';
import { OrderEventType, ISavedOrderEvent, IOrderEvent } from '../../domain/events/order-events.interface';
import { OrderInvalidEventTypeError } from '../../domain/errors/order.errors';

describe('FirestoreEventStore', () => {
  let firestoreEventStore: FirestoreEventStore;
  let mockCollection: any;

  beforeEach(async () => {
    mockCollection = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      add: jest.fn(),
    };

    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ sequenceNumber: 1 }) }],
    });

    const firestoreClient = {
      firestore: {
        collection: jest.fn().mockReturnValue(mockCollection),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirestoreEventStore, { provide: FirestoreClient, useValue: firestoreClient }],
    }).compile();

    firestoreEventStore = module.get<FirestoreEventStore>(FirestoreEventStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save valid order events', async () => {
    const mockOrder = {
      props: { id: 'order1' },
      getUncommittedEvents: jest.fn().mockReturnValue([
        {
          eventType: OrderEventType.CREATED,
          payload: { id: 'order1' },
        },
      ]),
    } as unknown as Order;

    await firestoreEventStore.save(mockOrder);

    expect(mockCollection.add).toHaveBeenCalledTimes(1);
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        sequenceNumber: 2, // Should be incremented to 2
      }),
    );
    // Additional checks on the saved data can go here
  });

  it('should throw OrderInvalidEventTypeError for invalid events', async () => {
    const mockOrder = {
      props: { id: 'order1' },
      getUncommittedEvents: jest.fn().mockReturnValue([
        {
          eventType: 'InvalidType',
          payload: { id: 'order1' },
        },
      ]),
    } as unknown as Order;

    await expect(firestoreEventStore.save(mockOrder)).rejects.toThrow(OrderInvalidEventTypeError);
  });

  it('should retrieve events for a given order ID', async () => {
    const mockEvent: IOrderEvent = {
      eventType: OrderEventType.CREATED,
      payload: { id: 'order1' },
    };
    mockCollection.get.mockResolvedValue({
      docs: [{ data: () => mockEvent }],
    });

    const events = await firestoreEventStore.getEventsForOrder('order1');
    expect(events).toEqual([mockEvent]);
  });
});
