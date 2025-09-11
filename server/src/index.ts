import { WebSocketServer, WebSocket } from "ws"
import { createPublicClient, webSocket, parseAbiItem } from "viem"
import { baseSepolia } from "viem/chains"

import { BoxClaimedArgs, encodeBoxClaimedEvents } from "./utils/encode"

// ==== CONFIG ====
// const CONTRACT_ADDRESS = "0x4f25aF152764737E6DDFb8cBEA7be66a553B70F4"
const CONTRACT_ADDRESS = "0x3A10d4F908A1d37EDF9597C0e856E8eb8a1D23a5"

// Event ABI (ví dụ: BoxClaimed)
const EVENT_ABI = [
  parseAbiItem("event BoxClaimed(address user, uint16 position, uint16 token)"),
]

// wss://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB

// Tạo client kết nối RPC qua WebSocket
const client = createPublicClient({
  chain: baseSepolia,
  // transport: webSocket("wss://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB"),
  transport: webSocket("wss://go.getblock.io/d0aca3a299984a3ab6561fbb9cba99af"),
  // transport: webSocket("wss://base-sepolia.core.chainstack.com/f261d7b1c99ec08c17270535b5ac79b9"),
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

// ==== WEBSOCKET SERVER ====
const wss = new WebSocketServer({ port: 8080 })
let sockets: WebSocket[] = []

wss.on("connection", (ws: WebSocket) => {
  sockets.push(ws)
  console.log("Client connected, total:", sockets.length)

  ws.on("close", () => {
    sockets = sockets.filter((s) => s !== ws)
    console.log("Client disconnected, total:", sockets.length)
  })
})

// // ==== LISTEN TO CONTRACT EVENTS ====
const rs = client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: EVENT_ABI,
  eventName: "BoxClaimed",
  onLogs: (logs) => {
    console.log("Events received:", logs.length)
    for (const log of logs) {
      console.log(`- User: ${log.args.user}, Position: ${log.args.position}, Token: ${log.args.token}`)
    }

    const args: BoxClaimedArgs[] = logs.map(log => ({
      user: '0x', position: log.args?.position || 0, token: log.args?.token || 0
    }))

    const encoded = encodeBoxClaimedEvents(args)

    // const message = JSON.stringify({ type: "BoxClaimed", data: logs })
    sockets.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(encoded)
      }
    })
  },
  pollingInterval: 4000,
})

console.log("✅ WebSocket server running on ws://localhost:8080")
