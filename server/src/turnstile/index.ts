import dotenv from 'dotenv'
import path from 'path'
import { Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { GiftContractAddress } from '../constant'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
const SECRET_KEY = process.env.TURNSTILE_SECRET || '';

interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname?: string; // the hostname of the site where the challenge was solved
  'error-codes'?: string[]; // optional
  action?: string; // optional, only if "action" was provided in the widget
  cdata?: string; // optional, only if "cdata" was provided in the widget
}

export async function validateTurnstile(token: string, remoteip = ''): Promise<TurnstileResponse> {
  const formData = new FormData();
  formData.append('secret', SECRET_KEY);
  formData.append('response', token);
  formData.append('remoteip', remoteip);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const result = (await response.json()) as TurnstileResponse;

    console.log('Turnstile validation result:', result);

    return result;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return { success: false, 'error-codes': ['internal-error'] };
  }
}

export interface SignatureResponse {
  user: Address
  deadline: number
  signature: `0x${string}`
}

export async function generateSignature(user: Address): Promise<SignatureResponse> {
  const deadline = Math.floor(Date.now() / 1000) + 300
  const signAccount = privateKeyToAccount(process.env.SIGNER_PK as Address)
  const signature = await signAccount.signTypedData({
    domain: {
      name: 'PixelGames Token Gift Box',
      version: '1',
      chainId: 8453,
      verifyingContract: GiftContractAddress,
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
  })

  return { user, deadline, signature }
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