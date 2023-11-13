import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IProfitLossRepository } from '../../domain/repositories/profit-loss.interface';
import { UpdateProfitLossAfterOrderFilledCommand } from '../commands/update-profitloss.command';
import { Inject, Logger } from '@nestjs/common';
import { IProfitLossTracker } from '../queries/profit-loss.readmodel.interface';
import { OrderSide } from '../../domain/models/order.interface';

@CommandHandler(UpdateProfitLossAfterOrderFilledCommand)
export class UpdateProfitLossTrackerHandler implements ICommandHandler<UpdateProfitLossAfterOrderFilledCommand> {
  constructor(@Inject('IProfitLossRepository') private readonly trackerRepository: IProfitLossRepository) {}

  async execute(command: UpdateProfitLossAfterOrderFilledCommand): Promise<void> {
    const orderDetails = command.orderDetails;

    let tracker: IProfitLossTracker;

    try {
      tracker = await this.trackerRepository.getProfitLoss(orderDetails.symbol);
    } catch (err) {
      Logger.error(`[UpdateProfitLossTrackerHandler] Error getting profit loss tracker ${orderDetails.symbol}: ${err}]`);
    }

    if (tracker) {
      tracker.lastUpdated = new Date();
      if (orderDetails.orderSide === OrderSide.BUY) {
        tracker.averageBuyPrice = (tracker.averageBuyPrice * tracker.totalBought + orderDetails.price * orderDetails.quantity) / (tracker.totalBought + orderDetails.quantity);
        tracker.currrentQuantity += orderDetails.quantity;
        tracker.totalBought += orderDetails.quantity;
      } else {
        tracker.averageSellPrice = (tracker.averageBuyPrice * tracker.totalSold + orderDetails.price * orderDetails.quantity) / (tracker.totalSold + orderDetails.quantity);
        tracker.netProfitLoss = (tracker.averageSellPrice - tracker.averageBuyPrice) * orderDetails.quantity;
        tracker.currrentQuantity -= orderDetails.quantity;
        tracker.totalSold += orderDetails.quantity;
      }
      try {
        await this.trackerRepository.save(tracker);
      } catch (err) {
        Logger.error(`[UpdateProfitLossTrackerHandler] Error updating profit loss tracker ${tracker.symbol}: ${err}]`);
      }
    } else {
      //WARN: This will only support single user for now as we are not passing userId
      tracker = {
        symbol: orderDetails.symbol,
        averageBuyPrice: OrderSide.BUY === orderDetails.orderSide ? orderDetails.price : 0,
        averageSellPrice: OrderSide.SELL === orderDetails.orderSide ? orderDetails.price : 0,
        currrentQuantity: orderDetails.quantity,
        netProfitLoss: 0,
        totalBought: OrderSide.BUY === orderDetails.orderSide ? orderDetails.quantity : 0,
        totalSold: OrderSide.SELL === orderDetails.orderSide ? orderDetails.quantity : 0,
        lastUpdated: new Date(),
      };
      try {
        await this.trackerRepository.save(tracker);
      } catch (err) {
        Logger.error(`[UpdateProfitLossTrackerHandler] Error saving profit loss tracker ${tracker.symbol}: ${err}]`);
      }
    }
  }
}