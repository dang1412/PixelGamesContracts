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
const account = (0, accounts_1.privateKeyToAccount)(process.env.TESTNET_OWNER_PK // ⚠️ never commit this
);
// 2. Create wallet client with Tatum RPC + API key header
const client = (0, viem_1.createWalletClient)({
    account,
    chain: chains_1.baseSepolia,
    transport: (0, viem_1.http)('https://base-sepolia.gateway.tatum.io', {
        fetchOptions: {
            headers: {
                'x-api-key': 't-67919a2e57673415a4b4fd77-11e5658d5ecf4a19a3ed8c30',
            },
        },
    }),
});
// 3. Define contract ABI (only the function you need is enough)
const abi = (0, viem_1.parseAbi)([
    'function updateBaseBoxCooldown(uint32 _boxCooldown) external',
]);
// 4. Call the contract
async function main() {
    const txHash = await client.writeContract({
        address: '0x3A10d4F908A1d37EDF9597C0e856E8eb8a1D23a5', // replace with your deployed contract
        abi,
        functionName: 'updateBaseBoxCooldown',
        args: [60], // <-- pass your uint32 value here
    });
    console.log('Transaction hash:', txHash);
}
main().catch(console.error);
