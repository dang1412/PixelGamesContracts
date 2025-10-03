"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTurnstile = validateTurnstile;
exports.generateSignature = generateSignature;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const accounts_1 = require("viem/accounts");
const constant_1 = require("../constant");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const SECRET_KEY = process.env.TURNSTILE_SECRET || '';
async function validateTurnstile(token, remoteip = '') {
    const formData = new FormData();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', remoteip);
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
        });
        const result = (await response.json());
        console.log('Turnstile validation result:', result);
        return result;
    }
    catch (error) {
        console.error('Turnstile validation error:', error);
        return { success: false, 'error-codes': ['internal-error'] };
    }
}
async function generateSignature(user) {
    const deadline = Math.floor(Date.now() / 1000) + 300;
    const signAccount = (0, accounts_1.privateKeyToAccount)(process.env.SIGNER_PK);
    const signature = await signAccount.signTypedData({
        domain: {
            name: 'PixelGames Token Gift Box',
            version: '1',
            chainId: 8453,
            verifyingContract: constant_1.GiftContractAddress,
        },
        types: {
            Permit: [
                { name: 'user', type: 'address' },
                { name: 'deadline', type: 'uint256' },
            ],
        },
        primaryType: 'Permit',
        message: {
            user,
            deadline: BigInt(deadline)
        },
    });
    return { user, deadline, signature };
}
// Usage in form handler
// async function handleFormSubmission(request) {
// const body = await request.formData();
// const token = body.get('cf-turnstile-response');
// const ip = request.headers.get('CF-Connecting-IP') ||
// request.headers.get('X-Forwarded-For') ||
// 'unknown';
//       const validation = await validateTurnstile(token, ip);
//       if (validation.success) {
//           // Token is valid - process the form
//           console.log('Valid submission from:', validation.hostname);
//           return processForm(body);
//       } else {
//           // Token is invalid - reject the submission
//           console.log('Invalid token:', validation['error-codes']);
//           return new Response('Invalid verification', { status: 400 });
//       }
// }
