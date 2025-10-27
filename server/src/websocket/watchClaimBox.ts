import { parseAbiItem, PublicClient } from 'viem'
import { WebSocket } from 'ws'

import { GiftContractAddress } from '../constant'
import { BoxClaimedArgs } from './types'
import { encodeBoxClaimedEvents } from './encodeClaimBox'

// Event ABI (ví dụ: BoxClaimed)
const BoxClaimEventAbi = [
  parseAbiItem('event BoxClaimed(address user, uint16 position, uint16 token)'),
]

export function watchClaimBox(client: PublicClient, sockets: WebSocket[]) {
  client.watchContractEvent({
    address: GiftContractAddress,
    abi: BoxClaimEventAbi,
    eventName: 'BoxClaimed',
    onLogs: (logs) => {
      console.log('Events received:', logs.length, new Date())
      for (const log of logs) {
        console.log(`- User: ${log.args.user}, Position: ${log.args.position}, Token: ${log.args.token}`)
      }

      const args: BoxClaimedArgs[] = logs.map(log => ({
        user: '0x', position: log.args?.position || 0, token: log.args?.token || 0
      }))

      const encoded = encodeBoxClaimedEvents(args)
  
      // const message = JSON.stringify({ type: 'BoxClaimed', data: logs })
      sockets.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(encoded)
        }
      })
    },
    // pollingInterval: 4000,
  })
}