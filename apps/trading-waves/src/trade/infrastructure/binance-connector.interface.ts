export interface StreamBaseEvent {
  e: string;
  E: number;
}

export interface StreamCallbacks<E extends StreamBaseEvent> {
  open: () => void;
  close: () => void;
  message: (event: E) => void;
}

//export type UserDataStreamFn = (listenKey: string, callbacks: StreamCallbacks<UserDataStreamEvent>) => WebSocketClient;

export type UserDataStreamEvent =
  | UserDataStreamOutboundAccountPositionEvent
  | UserDataStreamBalanceUpdateEvent
  | UserDataStreamExecutionReportEvent
  | UserDataStreamListStatusEvent;

export interface UserDataStreamOutboundAccountPositionEvent extends StreamBaseEvent {
  e: 'outboundAccountPosition';
  u: number;
  B: Array<{
    a: string;
    f: string; // decimal
    l: string; // decimal
  }>;
}

export interface UserDataStreamBalanceUpdateEvent extends StreamBaseEvent {
  e: 'balanceUpdate';
  a: string;
  d: string; // decimal
  T: number;
}

export const isExecutionReportEvent = (event: any): event is UserDataStreamExecutionReportEvent => {
  if (event.e === 'executionReport') {
    return true;
  }
  return false;
};

export interface UserDataStreamExecutionReportEvent extends StreamBaseEvent {
  e: 'executionReport';
  E: number;
  /** symbol */
  s: string;
  c: string;
  /** side */
  S: 'BUY' | 'SELL';
  o: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER';
  f: 'GTC' | 'FOK' | 'IOC';
  /** order qty */
  q: string; // decimal
  /** order price */
  p: string; // decimal
  /** stop price */
  P: string; // decimal
  F: string; // decimal
  g: number;
  C: string;
  /** current execution type */
  x: 'NEW' | 'CANCELED' | 'REPLACED' | 'REJECTED' | 'TRADE' | 'EXPIRED';
  /** order status */
  X: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';
  r: 'NONE' | number;
  i: string;
  l: string; // decimal
  z: string; // decimal
  L: string; // decimal
  n: string; // decimal
  N: null | string;
  T: number;
  t: number;
  v: number;
  I: number;
  w: boolean;
  m: boolean;
  M: boolean;
  O: number;
  Z: string; // decimal
  Y: string; // decimal
  Q: string; // decimal
  W: string; // decimal
  V: string; // decimal
}

export interface UserDataStreamListStatusEvent extends StreamBaseEvent {
  e: 'listStatus';
  s: string;
  g: number;
  c: 'OCO';
  l: 'RESPONSE' | 'EXEC_STARTED' | 'ALL_DONE';
  L: 'EXECUTING' | 'ALL_DONE' | 'REJECT';
  r: 'NONE' | number;
  C: string;
  T: number;
  O: Array<{
    s: string;
    i: number;
    c: string;
  }>;
}
