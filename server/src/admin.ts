import { Address, createWalletClient, http, parseAbi, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 1. Import your private key
const account = privateKeyToAccount(
  process.env.MAINNET_OWNER_PK as `0x${string}` // ⚠️ never commit this
)

// 2. Create wallet client with Tatum RPC + API key header
const client = createWalletClient({
  account,
  chain: base,
  transport: http('https://base-mainnet.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'),
})

// 3. Define contract ABI (only the function you need is enough)
const abi = parseAbi([
  'function updateBaseBoxCooldown(uint32 _boxCooldown) external',
  'function setSigner(address _signer) external'
])

// 4. Call the contract
async function main() {
  const txHash = await client.writeContract({
    address: '0x83514843b0A11398e98e99873908c1d6f1C1CaeA', // replace with your deployed contract
    abi,
    functionName: 'updateBaseBoxCooldown',
    args: [60], // <-- pass your uint32 value here
  })

  // const txHash = await client.writeContract({
  //   address: '0x83514843b0A11398e98e99873908c1d6f1C1CaeA', // replace with your deployed contract
  //   abi,
  //   functionName: 'setSigner',
  //   // args: [process.env.SIGNER as Address], // <-- pass your uint32 value here
  //   args: ['0x0000000000000000000000000000000000000000']
  // })

  console.log('Transaction hash:', txHash)
}

main().catch(console.error)
