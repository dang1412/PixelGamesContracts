import { Address, hashTypedData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// All properties on a domain are optional
const domain = {
  name: 'PixelGames Token Gift Box',
  version: '1',
  chainId: 8453,
  verifyingContract: '0x2e234DAe75C793f67A35089C9d99245E1C58470b',
} as const

// Test Gift address: 0x2e234DAe75C793f67A35089C9d99245E1C58470b
// Mainnet Gift address: 0x83514843b0A11398E98e99873908C1D6F1c1caEa

// The named list of all type definitions
const types = {
  Claim: [
    { name: 'user', type: 'address' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const

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

  const account = privateKeyToAccount(process.env.SIGNER_PK as Address)

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
  } as const

  const digest = hashTypedData(typeData)
  
  const signature = await account.sign({
    hash: digest,
  })
  
  console.log(digest, '\n', signature)

  const signature2 = await account.signTypedData(typeData)
  console.log(signature2)

  // viem: 
  //  - 0xe51911c6967caafa4117559e24770476c05c0f4198699f524a43fab309d5fd61
  //  - 0xc391d4010d47a918d95ce5dc3a9ab17e020ff094770809a58b2e204148b5642f1d8d31e1a36ca01adea0aac2d761c50f68ee97c64edff0ba416f2d310864b47c1b
  // solidity:
  //  - 0xe51911c6967caafa4117559e24770476c05c0f4198699f524a43fab309d5fd61
  //  - 0xc391d4010d47a918d95ce5dc3a9ab17e020ff094770809a58b2e204148b5642f1d8d31e1a36ca01adea0aac2d761c50f68ee97c64edff0ba416f2d310864b47c1b
}

signClaim()