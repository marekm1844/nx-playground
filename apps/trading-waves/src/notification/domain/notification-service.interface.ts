import { Notification } from "./models/notification.entity";

export interface INotificationService {
    sendNotification(notification: Notification): Promise<void>;
  }