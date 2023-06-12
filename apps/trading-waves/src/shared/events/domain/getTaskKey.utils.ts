export function getTaskKey(symbol: string, interval: string): string {
  return `${symbol}-${interval}`;
}
