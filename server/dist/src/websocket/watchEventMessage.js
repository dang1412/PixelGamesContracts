"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchEventMessage = watchEventMessage;
const viem_1 = require("viem");
const constant_1 = require("../constant");
// Event Abi
const SendMessageEventAbi = [
    (0, viem_1.parseAbiItem)('event SendMessage(address indexed from, address indexed to, string content)'),
];
function watchEventMessage(client, accountToSockets = {}) {
    client.watchContractEvent({
        address: constant_1.EventMessageContractAddress,
        abi: SendMessageEventAbi,
        eventName: 'SendMessage',
        onLogs: (logs) => {
            console.log('Events received:', logs.length, new Date());
            for (const log of logs) {
                const msg = { from: log.args.from, to: log.args.to, content: log.args.content };
                console.log(`- From: ${msg.from}, To: ${msg.to}, Content: ${msg.content}`);
                if (!msg.to)
                    continue;
                const sockets = accountToSockets[msg.to.toLowerCase()] || [];
                for (const ws of sockets) {
                    ws.send(JSON.stringify(msg));
                }
            }
        },
    });
}
