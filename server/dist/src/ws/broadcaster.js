"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = broadcast;
exports.broadcastSingle = broadcastSingle;
// src/broadcaster.ts
const ws_1 = require("ws");
/**
 * Gửi dữ liệu đến tất cả client đã đăng ký một channel.
 * @param wss - Đối tượng WebSocketServer
 * @param channel - Tên channel
 * @param data - Payload dữ liệu
 */
function broadcast(wss, // Nhận wss làm tham số
channel, data) {
    const message = {
        channel: channel,
        data: data,
    };
    const messageString = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN &&
            client.subscriptions.has(channel)) {
            client.send(messageString);
        }
    });
}
function broadcastSingle(ws, channel, data) {
    const message = {
        channel: channel,
        data: data,
    };
    const messageString = JSON.stringify(message);
    if (ws.readyState === ws_1.WebSocket.OPEN && ws.subscriptions.has(channel)) {
        ws.send(messageString);
    }
}
