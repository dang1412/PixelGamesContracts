"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastEventMessage = broadcastEventMessage;
const viem_1 = require("viem");
const constant_1 = require("../constant");
const broadcaster_1 = require("./broadcaster"); // Import hàm broadcast
const client_1 = require("./client");
// Event Abi
const SendMessageEventAbi = [
    (0, viem_1.parseAbiItem)('event SendMessage(address indexed from, address indexed to, string content)'),
];
/**
 * @param wss - Đối tượng WebSocketServer
 */
function broadcastEventMessage(wss) {
    client_1.client.watchContractEvent({
        address: constant_1.EventMessageContractAddress,
        abi: SendMessageEventAbi,
        eventName: 'SendMessage',
        onLogs: (logs) => {
            console.log('Events received:', logs.length, new Date());
            for (const log of logs) {
                const { from, to, content } = log.args;
                if (from && to && content) {
                    (0, broadcaster_1.broadcast)(wss, `message-to-${to.toLowerCase()}`, { from, content });
                }
            }
        },
    });
}
