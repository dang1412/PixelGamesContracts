"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const websocket_1 = require("./websocket");
function getClientIp(req, ws) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(',')[0].trim();
    return ip || ws._socket.remoteAddress?.replace(/^::ffff:/, '') || 'unknown';
}
// Tạo client kết nối RPC qua WebSocket
const client = (0, viem_1.createPublicClient)({
    chain: chains_1.baseSepolia,
    transport: (0, viem_1.webSocket)('wss://base-mainnet.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'),
    // transport: webSocket('wss://go.getblock.io/d0aca3a299984a3ab6561fbb9cba99af'),
    // transport: webSocket('wss://base-sepolia.core.chainstack.com/f261d7b1c99ec08c17270535b5ac79b9'),
    // transport: roundRobinHttp([
    //   // {url: 'https://sepolia.base.org'},
    //   {
    //     url: 'https://base-sepolia.gateway.tatum.io',
    //     config: {
    //       fetchOptions: {
    //         headers: {
    //           'x-api-key': 't-67919a2e57673415a4b4fd77-11e5658d5ecf4a19a3ed8c30',
    //         },
    //       },
    //     }
    //   },
    //   {url: 'https://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'},
    // ]),
});
// ==== WEBSOCKET SERVER ====
const wss = new ws_1.WebSocketServer({ port: 8080 });
let sockets = [];
const accountToSockets = {};
wss.on('connection', (ws, req) => {
    sockets.push(ws);
    const ip = getClientIp(req, ws);
    console.log(`Client connected ${ip}, total:`, sockets.length, new Date());
    ws.on('close', () => {
        sockets = sockets.filter((s) => s !== ws);
        console.log(`Client disconnected ${ip}, total:`, sockets.length, new Date());
    });
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            if (message.type === 'subscribe' && message.address) {
                accountToSockets[message.address] = accountToSockets[message.address] || [];
                accountToSockets[message.address].push(ws);
                console.log(`Address ${message.address} registered for WebSocket updates.`);
            }
            else if (message.type === 'unsubscribe' && message.address && accountToSockets[message.address]) {
                accountToSockets[message.address] = accountToSockets[message.address].filter((s) => s !== ws);
                console.log(`Address ${message.address} unregistered from WebSocket updates.`);
            }
        }
        catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    });
});
// claimBox event
(0, websocket_1.watchClaimBox)(client, sockets);
// message event
(0, websocket_1.watchEventMessage)(client, accountToSockets);
console.log('✅ WebSocket server running on ws://localhost:8080');
