"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchClaimBox = watchClaimBox;
const viem_1 = require("viem");
const constant_1 = require("../constant");
const encodeClaimBox_1 = require("./encodeClaimBox");
// Event ABI (ví dụ: BoxClaimed)
const BoxClaimEventAbi = [
    (0, viem_1.parseAbiItem)('event BoxClaimed(address user, uint16 position, uint16 token)'),
];
function watchClaimBox(client, sockets) {
    client.watchContractEvent({
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
            const encoded = (0, encodeClaimBox_1.encodeBoxClaimedEvents)(args);
            // const message = JSON.stringify({ type: 'BoxClaimed', data: logs })
            sockets.forEach((ws) => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(encoded);
                }
            });
        },
        // pollingInterval: 4000,
    });
}
