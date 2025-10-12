import { createWalletClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

// 1. Import your private key
const account = privateKeyToAccount(
  process.env.TESTNET_OWNER_PK as `0x${string}` // ⚠️ never commit this
)

// 2. Create wallet client with Tatum RPC + API key header
const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'),
})

// 3. Define contract ABI (only the function you need is enough)
const abi = parseAbi([
//   'function updateBaseBoxCooldown(uint32 _boxCooldown) external',
//   'function setSigner(address _signer) external',
  'function withdraw() external',
])

// 4. Call the contract
async function main() {
  const txHash = await client.writeContract({
    address: '0x8530792350A65c929c0109d506Cf53C81c1b65E4', // replace with your deployed contract
    abi,
    functionName: 'withdraw',
  })

  console.log('Transaction hash:', txHash)
}

main().catch(console.error)