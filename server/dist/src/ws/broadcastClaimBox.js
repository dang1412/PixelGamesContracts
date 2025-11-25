"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastClaimBox = broadcastClaimBox;
const viem_1 = require("viem");
const constant_1 = require("../constant");
const broadcaster_1 = require("./broadcaster"); // Import hàm broadcast
const client_1 = require("./client");
const BoxClaimEventAbi = [
    (0, viem_1.parseAbiItem)('event BoxClaimed(address user, uint16 position, uint16 token)'),
];
/**
 * @param wss - Đối tượng WebSocketServer
 */
function broadcastClaimBox(wss) {
    client_1.client.watchContractEvent({
        address: constant_1.GiftContractAddress,
        abi: BoxClaimEventAbi,
        eventName: 'BoxClaimed',
        onLogs: (logs) => {
            console.log('Events received:', logs.length, new Date());
            for (const log of logs) {
                console.log(`- User: ${log.args.user}, Position: ${log.args.position}, Token: ${log.args.token}`);
            }
            const args = logs.map(log => ({
                user: '0x', position: log.args?.position || 0, token: log.args?.token || 0
            }));
            (0, broadcaster_1.broadcast)(wss, 'box-claimed', args);
        },
    });
}
