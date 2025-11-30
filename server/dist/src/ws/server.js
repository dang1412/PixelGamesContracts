"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
require("dotenv/config");
const ws_1 = require("ws");
const broadcaster_1 = require("./broadcaster"); // Import hàm broadcast
const broadcastClaimBox_1 = require("./broadcastClaimBox"); // Import bộ mô phỏng
const broadcastEventMessage_1 = require("./broadcastEventMessage");
const funcs_1 = require("./bomb/funcs");
const createClient_1 = require("./bomb/createClient");
const PORT = 8080;
const wss = new ws_1.WebSocketServer({ port: PORT });
console.log(`WebSocket server running on port ${PORT}...`);
function extractNameFromMessageChannel(channel) {
    const match = channel.match(/^message-to-(.+)$/);
    return match ? match[1] : null;
}
function getClientIp(req, ws) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(',')[0].trim();
    return ip || ws._socket.remoteAddress?.replace(/^::ffff:/, '') || 'unknown';
}
const nameToWsMap = new Map();
wss.on('connection', (_ws, req) => {
    console.log('Client connected');
    const ip = getClientIp(req, _ws);
    const ws = _ws;
    ws.subscriptions = new Set();
    ws.ip = ip;
    ws.on('message', (messageAsString) => {
        try {
            const message = JSON.parse(messageAsString);
            switch (message.action) {
                case 'signInTemp':
                    const { wsName, referer } = message;
                    ws.name = wsName;
                    console.log(`Client temp signed in as: ${wsName}`);
                    nameToWsMap.set(wsName, ws);
                    break;
                case 'subscribe':
                    ws.subscriptions.add(message.channel);
                    console.log(`Client subscribed to: ${message.channel}`);
                    break;
                case 'walletConnected':
                    if (ws.name) {
                        (0, createClient_1.updateClientWalletAddress)(ws.name, message.walletAddr);
                    }
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
                    const { to, content } = message.payload;
                    const from = ws.name;
                    const toWs = nameToWsMap.get(to);
                    if (from && to && toWs) {
                        const personalPayload = {
                            from,
                            content,
                        };
                        (0, broadcaster_1.broadcastSingle)(toWs, `message-to-${to}`, personalPayload);
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
    // disconnect handler
    const disconnect = () => nameToWsMap.delete(ws.name);
    ws.on('close', () => {
        console.log('Client disconnected', ws.name);
        disconnect();
    });
    ws.on('error', (error) => console.error('WebSocket error:', error));
});
// --- KHỞI ĐỘNG CÁC DỊCH VỤ ---
// Chỉ cần gọi hàm này một lần và truyền `wss` vào
(0, broadcastClaimBox_1.broadcastClaimBox)(wss);
(0, broadcastEventMessage_1.broadcastEventMessage)(wss);
