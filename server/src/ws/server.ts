// src/server.ts
import { WebSocketServer } from 'ws';
import { CustomWebSocket, ClientMessage, ChannelPayloadMap } from './types'; // Import từ types.ts
import { broadcast } from './broadcaster'; // Import hàm broadcast
import { broadcastClaimBox } from './broadcastClaimBox'; // Import bộ mô phỏng
import { broadcastEventMessage } from './broadcastEventMessage';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT }) as WebSocketServer;

console.log(`WebSocket server running on port ${PORT}...`);

wss.on('connection', (_ws) => {
  console.log('Client connected');
  const ws = _ws as CustomWebSocket;
  ws.subscriptions = new Set<string>();

  ws.on('message', (messageAsString: string) => {
    try {
      const message: ClientMessage = JSON.parse(messageAsString);

      switch (message.action) {
        case 'subscribe':
          ws.subscriptions.add(message.channel);
          console.log(`Client subscribed to: ${message.channel}`);
          break;

        case 'unsubscribe':
          ws.subscriptions.delete(message.channel);
          console.log(`Client unsubscribed from: ${message.channel}`);
          break;

        case 'chat_message':
          const chatPayload: ChannelPayloadMap['global-chat'] = {
            user: message.payload.user || 'Anonymous',
            text: message.payload.text,
            messageId: Date.now().toString(),
          };
          // Vẫn gọi hàm broadcast như cũ, truyền wss vào
          broadcast(wss, 'global-chat', chatPayload);
          break;

        case 'send_message':
          const { from, to, content } = message.payload
          if (to) {
            const personalPayload: ChannelPayloadMap[`message-to-${string}`] = {
              from,
              content,
            };
            broadcast(wss, `message-to-${to}`, personalPayload);
            console.log(`Sent personal message: ${from}, ${to}, ${content}`);
          }
      }
    } catch (error) {
      console.error('Failed to parse message or invalid format:', error);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', (error) => console.error('WebSocket error:', error));
});

// --- KHỞI ĐỘNG CÁC DỊCH VỤ ---
// Chỉ cần gọi hàm này một lần và truyền `wss` vào
broadcastClaimBox(wss);
broadcastEventMessage(wss);