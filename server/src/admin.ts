import { createWalletClient, http, parseAbi, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 1. Import your private key
const account = privateKeyToAccount(
  process.env.TESTNET_OWNER_PK as `0x${string}` // ⚠️ never commit this
)

// 2. Create wallet client with Tatum RPC + API key header
const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://base-sepolia.gateway.tatum.io', {
    fetchOptions: {
      headers: {
        'x-api-key': 't-67919a2e57673415a4b4fd77-11e5658d5ecf4a19a3ed8c30',
      },
    },
  }),
})

// 3. Define contract ABI (only the function you need is enough)
const abi = parseAbi([
  'function updateBaseBoxCooldown(uint32 _boxCooldown) external',
])

// 4. Call the contract
async function main() {
  const txHash = await client.writeContract({
    address: '0x3A10d4F908A1d37EDF9597C0e856E8eb8a1D23a5', // replace with your deployed contract
    abi,
    functionName: 'updateBaseBoxCooldown',
    args: [60], // <-- pass your uint32 value here
  })

  console.log('Transaction hash:', txHash)
}

main().catch(console.error)
