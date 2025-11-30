// src/server.ts
import 'dotenv/config'
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'

import { CustomWebSocket, ClientMessage, ChannelPayloadMap } from './types' // Import từ types.ts
import { broadcast, broadcastSingle } from './broadcaster' // Import hàm broadcast
import { broadcastClaimBox } from './broadcastClaimBox' // Import bộ mô phỏng
import { broadcastEventMessage } from './broadcastEventMessage'
import { handleBombGameMsg } from './bomb/funcs'
import { createClientIfNotExists, updateClientWalletAddress } from './bomb/createClient'

const PORT = 8080
const wss = new WebSocketServer({ port: PORT }) as WebSocketServer

console.log(`WebSocket server running on port ${PORT}...`)

function extractNameFromMessageChannel(channel: string): string | null {
  const match = channel.match(/^message-to-(.+)$/);
  return match ? match[1] : null;
}

function getClientIp(req: IncomingMessage, ws: WebSocket): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0].trim();

  return ip || (ws as any)._socket.remoteAddress?.replace(/^::ffff:/, '') || 'unknown';
}

const nameToWsMap: Map<string, CustomWebSocket> = new Map();

wss.on('connection', (_ws, req) => {
  console.log('Client connected')
  const ip = getClientIp(req, _ws)
  const ws = _ws as CustomWebSocket
  ws.subscriptions = new Set<string>()
  ws.ip = ip

  ws.on('message', (messageAsString: string) => {
    try {
      const message: ClientMessage = JSON.parse(messageAsString)

      switch (message.action) {
        case 'signInTemp':
          const { wsName, referer } = message
          ws.name = wsName
          console.log(`Client temp signed in as: ${wsName}`)
          nameToWsMap.set(wsName, ws)
          break
        case 'subscribe':
          ws.subscriptions.add(message.channel)
          console.log(`Client subscribed to: ${message.channel}`)
          break

        case 'walletConnected':
          if (ws.name) {
            updateClientWalletAddress(ws.name, message.walletAddr)
          }
          break

        case 'unsubscribe':
          ws.subscriptions.delete(message.channel)
          console.log(`Client unsubscribed from: ${message.channel}`)
          break

        case 'chat_message':
          const chatPayload: ChannelPayloadMap['global-chat'] = {
            user: message.payload.user || 'Anonymous',
            text: message.payload.text,
            messageId: Date.now().toString(),
          }
          // Vẫn gọi hàm broadcast như cũ, truyền wss vào
          broadcast(wss, 'global-chat', chatPayload)
          break

        case 'send_message':
          const { to, content } = message.payload
          const from = ws.name
          const toWs = nameToWsMap.get(to)
          if (from && to && toWs) {
            const personalPayload: ChannelPayloadMap[`message-to-${string}`] = {
              from,
              content,
            }
            broadcastSingle(toWs, `message-to-${to}`, personalPayload)
            console.log(`Sent personal message: ${from}, ${to}, ${content.substring(0, 100)}...`)
          }
          break
        case 'bomb_game':
          handleBombGameMsg(ws, message.msg)
          break
      }
    } catch (error) {
      console.error('Failed to parse message or invalid format:', error)
    }
  })

  // disconnect handler
  const disconnect = () => nameToWsMap.delete(ws.name)
  ws.on('close', () => {
    console.log('Client disconnected', ws.name)
    disconnect()
  })
  ws.on('error', (error) => console.error('WebSocket error:', error))
})

// --- KHỞI ĐỘNG CÁC DỊCH VỤ ---
// Chỉ cần gọi hàm này một lần và truyền `wss` vào
broadcastClaimBox(wss)
broadcastEventMessage(wss)