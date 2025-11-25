"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// 1. Import your private key
const account = (0, accounts_1.privateKeyToAccount)(process.env.MAINNET_OWNER_PK // ⚠️ never commit this
);
// 2. Create wallet client with Tatum RPC + API key header
const client = (0, viem_1.createWalletClient)({
    account,
    chain: chains_1.base,
    transport: (0, viem_1.http)('https://base-mainnet.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'),
});
// 3. Define contract ABI (only the function you need is enough)
const abi = (0, viem_1.parseAbi)([
    'function updateBaseBoxCooldown(uint32 _boxCooldown) external',
    'function setSigner(address _signer) external'
]);
// 4. Call the contract
async function main() {
    const txHash = await client.writeContract({
        address: '0x83514843b0A11398e98e99873908c1d6f1C1CaeA', // replace with your deployed contract
        abi,
        functionName: 'updateBaseBoxCooldown',
        args: [60], // <-- pass your uint32 value here
    });
    // const txHash = await client.writeContract({
    //   address: '0x83514843b0A11398e98e99873908c1d6f1C1CaeA', // replace with your deployed contract
    //   abi,
    //   functionName: 'setSigner',
    //   // args: [process.env.SIGNER as Address], // <-- pass your uint32 value here
    //   args: ['0x0000000000000000000000000000000000000000']
    // })
    console.log('Transaction hash:', txHash);
}
main().catch(console.error);
