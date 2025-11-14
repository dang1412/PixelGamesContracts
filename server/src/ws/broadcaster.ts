// src/broadcaster.ts
import { WebSocketServer, WebSocket } from 'ws'
import {
  ChannelPayloadMap,
  KnownChannel,
  ServerMessage,
  CustomWebSocket,
} from './types'

/**
 * Gửi dữ liệu đến tất cả client đã đăng ký một channel.
 * @param wss - Đối tượng WebSocketServer
 * @param channel - Tên channel
 * @param data - Payload dữ liệu
 */
export function broadcast<K extends KnownChannel>(
  wss: WebSocketServer, // Nhận wss làm tham số
  channel: K,
  data: ChannelPayloadMap[K]
): void {
  const message: ServerMessage<K> = {
    channel: channel,
    data: data,
  }
  const messageString = JSON.stringify(message)

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as CustomWebSocket).subscriptions.has(channel)
    ) {
      client.send(messageString)
    }
  })
}

export function broadcastSingle<K extends KnownChannel>(
  ws: WebSocket,
  channel: K,
  data: ChannelPayloadMap[K]
): void {
  const message: ServerMessage<K> = {
    channel: channel,
    data: data,
  }
  const messageString = JSON.stringify(message)

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(messageString)
  }
}
