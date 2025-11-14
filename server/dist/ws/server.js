"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
require("dotenv/config");
const ws_1 = require("ws");
const broadcaster_1 = require("./broadcaster"); // Import hàm broadcast
const broadcastClaimBox_1 = require("./broadcastClaimBox"); // Import bộ mô phỏng
const broadcastEventMessage_1 = require("./broadcastEventMessage");
const funcs_1 = require("./bomb/funcs");
const PORT = 8080;
const wss = new ws_1.WebSocketServer({ port: PORT });
console.log(`WebSocket server running on port ${PORT}...`);
wss.on('connection', (_ws) => {
    console.log('Client connected');
    const ws = _ws;
    ws.subscriptions = new Set();
    ws.on('message', (messageAsString) => {
        try {
            const message = JSON.parse(messageAsString);
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
                    const chatPayload = {
                        user: message.payload.user || 'Anonymous',
                        text: message.payload.text,
                        messageId: Date.now().toString(),
                    };
                    // Vẫn gọi hàm broadcast như cũ, truyền wss vào
                    (0, broadcaster_1.broadcast)(wss, 'global-chat', chatPayload);
                    break;
                case 'send_message':
                    const { from, to, content } = message.payload;
                    if (to) {
                        const personalPayload = {
                            from,
                            content,
                        };
                        (0, broadcaster_1.broadcast)(wss, `message-to-${to}`, personalPayload);
                        console.log(`Sent personal message: ${from}, ${to}, ${content.substring(0, 100)}...`);
                    }
                    break;
                case 'bomb_game':
                    (0, funcs_1.handleBombGameMsg)(ws, message.msg);
                    break;
            }
        }
        catch (error) {
            console.error('Failed to parse message or invalid format:', error);
        }
    });
    ws.on('close', () => console.log('Client disconnected'));
    ws.on('error', (error) => console.error('WebSocket error:', error));
});
// --- KHỞI ĐỘNG CÁC DỊCH VỤ ---
// Chỉ cần gọi hàm này một lần và truyền `wss` vào
(0, broadcastClaimBox_1.broadcastClaimBox)(wss);
(0, broadcastEventMessage_1.broadcastEventMessage)(wss);
