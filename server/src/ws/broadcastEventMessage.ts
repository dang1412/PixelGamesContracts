import { WebSocketServer } from 'ws'
import { parseAbiItem } from 'viem'

import { EventMessageContractAddress } from '../constant'
import { broadcast } from './broadcaster' // Import hàm broadcast
import { client } from './client'

// Event Abi
const SendMessageEventAbi = [
  parseAbiItem('event SendMessage(address indexed from, address indexed to, string content)'),
]

/**
 * @param wss - Đối tượng WebSocketServer
 */
export function broadcastEventMessage(wss: WebSocketServer): void {
  client.watchContractEvent({
    address: EventMessageContractAddress,
    abi: SendMessageEventAbi,
    eventName: 'SendMessage',
    onLogs: (logs) => {
      console.log('Events received:', logs.length, new Date())

      for (const log of logs) {
        const { from, to, content } = log.args
        if (from && to && content) {
          broadcast(wss, `message-to-${to.toLowerCase()}`, { from, content })
        }
      }
    },
  })
}