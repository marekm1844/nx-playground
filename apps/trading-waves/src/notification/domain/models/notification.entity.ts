import { NotificationType } from "./notification-type.enum";

export  class Notification {
    id: string;
    chatId: number;
    price: number;
    symbol: string;
    type: NotificationType;
    interval: string;
    source: string;
    createdAt: Date;
}