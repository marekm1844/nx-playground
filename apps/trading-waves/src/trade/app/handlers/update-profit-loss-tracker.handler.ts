import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IProfitLossRepository } from '../../domain/repositories/profit-loss.interface';
import { UpdateProfitLossAfterOrderFilledCommand } from '../commands/update-profitloss.command';
import { Inject, Logger } from '@nestjs/common';
import { IDailyProfitLossTracker, IProfitLossTracker, isDailyProfitLossTracker } from '../queries/profit-loss.readmodel.interface';
import { OrderSide } from '../../domain/models/order.interface';
import { ProfitLossEventDto } from '../../domain/dto/profit-loss-event.dto';
import { CustomRepositoryCannotInheritRepositoryError } from 'typeorm';

@CommandHandler(UpdateProfitLossAfterOrderFilledCommand)
export class UpdateProfitLossTrackerHandler implements ICommandHandler<UpdateProfitLossAfterOrderFilledCommand> {
  constructor(@Inject('IProfitLossRepository') private readonly trackerRepository: IProfitLossRepository) {}

  async execute(command: UpdateProfitLossAfterOrderFilledCommand): Promise<void> {
    const orderDetails = command.orderDetails;

    let tracker: IProfitLossTracker;
    let newTracker: IProfitLossTracker;

    try {
      tracker = await this.trackerRepository.getProfitLoss(orderDetails.symbol);
    } catch (err) {
      Logger.error(`[UpdateProfitLossTrackerHandler] Error getting profit loss tracker ${orderDetails.symbol}: ${err}]`);
    }

    if (tracker) {
      this.updateTracker(tracker, orderDetails);
    } else {
      newTracker = this.createNewTracker(orderDetails);
    }

    let dailyTracker: IDailyProfitLossTracker;
    try {
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      dailyTracker = await this.trackerRepository.getDailyProfitLoss(orderDetails.symbol, Number(date));
    } catch (err) {
      Logger.error(`[UpdateProfitLossTrackerHandler] Error getting daily profit loss tracker ${orderDetails.symbol}: ${err}]`);
    }
    if (dailyTracker) {
      this.updateTracker(dailyTracker, orderDetails);
    } else {
      this.createNewDailyTracker(newTracker);
    }
  }

  private updateTracker(tracker: IProfitLossTracker | IDailyProfitLossTracker, orderDetails: ProfitLossEventDto) {
    tracker.lastUpdated = new Date();
    if (orderDetails.orderSide === OrderSide.BUY) {
      this.updateBuyTracker(tracker, orderDetails);
    } else {
      this.updateSellTracker(tracker, orderDetails);
    }
    Logger.debug(`[UpdateProfitLossTrackerHandler] Updating profit loss tracker ${JSON.stringify(tracker)}`);
    if (isDailyProfitLossTracker(tracker)) {
      this.saveDailyTracker(tracker);
    } else {
      this.saveTracker(tracker);
    }
  }

  private updateBuyTracker(tracker: IProfitLossTracker, orderDetails: ProfitLossEventDto) {
    tracker.averageBuyPrice = (tracker.averageBuyPrice * tracker.totalBought + orderDetails.cummulativeQuoteQty) / (tracker.totalBought + orderDetails.quantity);
    tracker.currrentQuantity += orderDetails.quantity;
    tracker.totalBought += orderDetails.quantity;
  }

  private updateSellTracker(tracker: IProfitLossTracker, orderDetails: ProfitLossEventDto) {
    tracker.averageSellPrice = (tracker.averageSellPrice * tracker.totalSold + orderDetails.cummulativeQuoteQty) / (tracker.totalSold + orderDetails.quantity);
    tracker.netProfitLoss = (tracker.averageSellPrice - tracker.averageBuyPrice) * orderDetails.quantity;
    tracker.currrentQuantity -= orderDetails.quantity;
    tracker.totalSold += orderDetails.quantity;
  }

  private saveTracker(tracker: IProfitLossTracker) {
    try {
      this.trackerRepository.save(tracker);
    } catch (err) {
      Logger.error(`[UpdateProfitLossTrackerHandler] Error updating profit loss tracker ${tracker.symbol}: ${err}]`);
    }
  }

  private saveDailyTracker(tracker: IDailyProfitLossTracker) {
    try {
      this.trackerRepository.saveDaily(tracker);
    } catch (err) {
      Logger.error(`[UpdateProfitLossTrackerHandler] Error updating daily profit loss tracker ${tracker.symbol}: ${err}]`);
    }
  }

  private createNewTracker(orderDetails: ProfitLossEventDto) {
    const tracker = {
      symbol: orderDetails.symbol,
      averageBuyPrice: OrderSide.BUY === orderDetails.orderSide ? orderDetails.cummulativeQuoteQty / orderDetails.quantity : 0,
      averageSellPrice: OrderSide.SELL === orderDetails.orderSide ? orderDetails.cummulativeQuoteQty / orderDetails.quantity : 0,
      currrentQuantity: orderDetails.quantity,
      netProfitLoss: 0,
      totalBought: OrderSide.BUY === orderDetails.orderSide ? orderDetails.quantity : 0,
      totalSold: OrderSide.SELL === orderDetails.orderSide ? orderDetails.quantity : 0,
      lastUpdated: new Date(),
    };
    this.saveTracker(tracker);
    return tracker;
  }

  private createNewDailyTracker(tracker: IProfitLossTracker) {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const dailyTracker = {
      ...tracker,
      date: Number(date),
    };
    this.saveDailyTracker(dailyTracker);
    return dailyTracker;
  }
}
