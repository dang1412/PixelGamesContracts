"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
exports.client = (0, viem_1.createPublicClient)({
    chain: chains_1.base,
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
