// src/types.ts
import { WebSocket } from 'ws';

// "Bản đồ" các channel và payload tương ứng
export interface ChannelPayloadMap {
  'btc-price': { price: number; timestamp: number };
  'eth-price': { price: number; timestamp: number };
  'global-chat': { user: string; text: string; messageId: string };
  'admin-notifications': { type: 'error' | 'info'; message: string };
  'box-claimed': BoxClaimedArgs[];
}

// Helper type để lấy tên các channel
export type KnownChannel = keyof ChannelPayloadMap;

// Tin nhắn client GỬI LÊN
export type ClientMessage =
  | { action: 'subscribe'; channel: string }
  | { action: 'unsubscribe'; channel: string }
  | { action: 'chat_message'; payload: { user?: string; text: string } };

// Tin nhắn server GỬI XUỐNG
export interface ServerMessage<K extends KnownChannel> {
  channel: K;
  data: ChannelPayloadMap[K];
}

// Mở rộng WebSocket gốc
export interface CustomWebSocket extends WebSocket {
  subscriptions: Set<string>;
}

export interface BoxClaimedArgs {
  user: `0x${string}` // 20bytes
  position: number  // 2bytes
  token: number // 1byte
}
