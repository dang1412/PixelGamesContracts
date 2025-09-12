"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundRobinHttp = roundRobinHttp;
const viem_1 = require("viem");
// let isRoundRobinEnabled = true
// export function enableRoundRobinHttp(isEnable: boolean) {
//   isRoundRobinEnabled = isEnable
// }
function roundRobinHttp(configs) {
    let i = 0;
    setInterval(() => {
        i = (i + 1) % configs.length;
    }, 120000);
    return (opts) => {
        // use viem's built-in http transport with that url
        return {
            // same shape viem expects
            ...(0, viem_1.http)()(opts),
            request: async (args) => {
                const config = configs[i];
                console.log('----------- Request -------------', config.url, args.method);
                // pick next config
                // i = isRoundRobinEnabled ? (i + 1) % configs.length : i
                return (0, viem_1.http)(config.url, config.config)(opts).request(args);
            },
        };
    };
}
