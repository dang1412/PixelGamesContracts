import { WebSocketServer } from 'ws'
import { parseAbiItem } from 'viem'

import { GiftContractAddress } from '../constant'
import { BoxClaimedArgs } from './types'
import { broadcast } from './broadcaster' // Import hàm broadcast
import { client } from './client'

const BoxClaimEventAbi = [
  parseAbiItem('event BoxClaimed(address user, uint16 position, uint16 token)'),
]

/**
 * Khởi động bộ mô phỏng dữ liệu.
 * @param wss - Đối tượng WebSocketServer
 */
export function broadcastClaimBox(wss: WebSocketServer): void {
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

      broadcast(wss, 'box-claimed', args)
    },
  })
}