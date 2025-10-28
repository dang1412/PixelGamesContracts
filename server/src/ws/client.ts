import { createPublicClient, webSocket } from 'viem'
import { base } from 'viem/chains'

export const client = createPublicClient({
  chain: base,
  transport: webSocket('wss://base-mainnet.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'),
  // transport: webSocket('wss://go.getblock.io/d0aca3a299984a3ab6561fbb9cba99af'),
  // transport: webSocket('wss://base-sepolia.core.chainstack.com/f261d7b1c99ec08c17270535b5ac79b9'),
  // transport: roundRobinHttp([
  //   // {url: 'https://sepolia.base.org'},
  //   {
  //     url: 'https://base-sepolia.gateway.tatum.io',
  //     config: {
  //       fetchOptions: {
  //         headers: {
  //           'x-api-key': 't-67919a2e57673415a4b4fd77-11e5658d5ecf4a19a3ed8c30',
  //         },
  //       },
  //     }
  //   },
  //   {url: 'https://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'},
  // ]),
})
