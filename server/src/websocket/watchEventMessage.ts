import { parseAbiItem, PublicClient } from 'viem'
import { WebSocket } from 'ws'

import { EventMessageContractAddress } from '../constant'

// Event Abi
const SendMessageEventAbi = [
  parseAbiItem('event SendMessage(address indexed from, address indexed to, string content)'),
]

export function watchEventMessage(
  client: PublicClient,
  accountToSockets: Record<string, WebSocket[]> = {}
) {
  client.watchContractEvent({
    address: EventMessageContractAddress,
    abi: SendMessageEventAbi,
    eventName: 'SendMessage',
    onLogs: (logs) => {
      console.log('Events received:', logs.length, new Date())

      for (const log of logs) {
        const msg = { from: log.args.from, to: log.args.to, content: log.args.content }
        console.log(`- From: ${msg.from}, To: ${msg.to}, Content: ${msg.content}`)
        if (!msg.to) continue;
        const sockets = accountToSockets[msg.to.toLowerCase()] || []
        for (const ws of sockets) {
          ws.send(JSON.stringify(msg))
        }
      }
    },
  })
}