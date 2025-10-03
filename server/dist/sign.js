"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// All properties on a domain are optional
const domain = {
    name: 'PixelGames Token Gift Box',
    version: '1',
    chainId: 8453,
    verifyingContract: '0x2e234DAe75C793f67A35089C9d99245E1C58470b',
};
// Test Gift address: 0x2e234DAe75C793f67A35089C9d99245E1C58470b
// Mainnet Gift address: 0x83514843b0A11398E98e99873908C1D6F1c1caEa
// The named list of all type definitions
const types = {
    Claim: [
        { name: 'user', type: 'address' },
        { name: 'deadline', type: 'uint256' },
    ],
};
// Example data
// const user = '0x1234...abcd'
// const deadline = Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes from now
// const message = {
//   user,
//   deadline,
// }
async function signClaim() {
    //   const [account] = await client.requestAddresses()
    //   const signature = await client.signTypedData({
    //     account,
    //     domain,
    //     types,
    //     primaryType: 'Claim',
    //     message,
    //   })
    //   console.log('Signature:', signature)
    //   return { signature, deadline, user }
    const account = (0, accounts_1.privateKeyToAccount)(process.env.SIGNER_PK);
    const typeData = {
        domain: {
            name: 'PixelGames Token Gift Box',
            version: '1',
            chainId: 8453,
            verifyingContract: '0x2e234DAe75C793f67A35089C9d99245E1C58470b',
        },
        types: {
            Permit: [
                { name: 'user', type: 'address' },
                { name: 'deadline', type: 'uint256' },
            ],
        },
        primaryType: 'Permit',
        message: {
            user: '0xA957b9d6911472dfCa44552fcad82d342fea496B',
            deadline: 10000n
        },
    };
    const digest = (0, viem_1.hashTypedData)(typeData);
    const signature = await account.sign({
        hash: digest,
    });
    console.log(digest, '\n', signature);
    const signature2 = await account.signTypedData(typeData);
    console.log(signature2);
    // viem: 
    //  - 0xe51911c6967caafa4117559e24770476c05c0f4198699f524a43fab309d5fd61
    //  - 0xc391d4010d47a918d95ce5dc3a9ab17e020ff094770809a58b2e204148b5642f1d8d31e1a36ca01adea0aac2d761c50f68ee97c64edff0ba416f2d310864b47c1b
    // solidity:
    //  - 0xe51911c6967caafa4117559e24770476c05c0f4198699f524a43fab309d5fd61
    //  - 0xc391d4010d47a918d95ce5dc3a9ab17e020ff094770809a58b2e204148b5642f1d8d31e1a36ca01adea0aac2d761c50f68ee97c64edff0ba416f2d310864b47c1b
}
signClaim();
